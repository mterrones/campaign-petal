import { useState, useCallback, useRef, useEffect } from "react";
import { EmailBlock, BlockType, InnerBlockType, InnerBlock, GlobalEmailStyles, DragState, defaultContent, defaultGlobalStyles, COLUMN_LAYOUTS } from "./types";

const MAX_HISTORY = 50;

export function useEmailEditor(initialBlocks: EmailBlock[] = []) {
  const [blocks, setBlocks] = useState<EmailBlock[]>(initialBlocks);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [selectedInner, setSelectedInner] = useState<{ blockId: string; colIndex: number; innerId: string } | null>(null);
  const [subject, setSubject] = useState("¡Novedades de este mes!");
  const [previewName, setPreviewName] = useState("Newsletter Abril");
  const [activeTab, setActiveTab] = useState("edit");
  const [globalStyles, setGlobalStyles] = useState<GlobalEmailStyles>({ ...defaultGlobalStyles });
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [showTemplateSelector, setShowTemplateSelector] = useState(true);

  // Undo/Redo
  const [history, setHistory] = useState<EmailBlock[][]>([initialBlocks]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const isUndoRedo = useRef(false);

  const pushHistory = useCallback((newBlocks: EmailBlock[]) => {
    if (isUndoRedo.current) { isUndoRedo.current = false; return; }
    setHistory(prev => {
      const trimmed = prev.slice(0, historyIndex + 1);
      const next = [...trimmed, newBlocks];
      if (next.length > MAX_HISTORY) next.shift();
      return next;
    });
    setHistoryIndex(prev => Math.min(prev + 1, MAX_HISTORY - 1));
  }, [historyIndex]);

  const setBlocksWithHistory = useCallback((newBlocks: EmailBlock[] | ((prev: EmailBlock[]) => EmailBlock[])) => {
    setBlocks(prev => {
      const resolved = typeof newBlocks === "function" ? newBlocks(prev) : newBlocks;
      pushHistory(resolved);
      return resolved;
    });
  }, [pushHistory]);

  const undo = useCallback(() => {
    if (historyIndex <= 0) return;
    isUndoRedo.current = true;
    const newIdx = historyIndex - 1;
    setHistoryIndex(newIdx);
    setBlocks(history[newIdx]);
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    isUndoRedo.current = true;
    const newIdx = historyIndex + 1;
    setHistoryIndex(newIdx);
    setBlocks(history[newIdx]);
  }, [history, historyIndex]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) { e.preventDefault(); redo(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo]);

  // Drag state
  const [dragState, setDragState] = useState<DragState>({
    draggedBlockId: null, draggedNewType: null, dropIndex: null,
    draggedInner: null, draggedInnerNewType: null, innerDropTarget: null,
  });
  const canvasRef = useRef<HTMLDivElement>(null);

  const resetDragState = useCallback(() => {
    setDragState({ draggedBlockId: null, draggedNewType: null, dropIndex: null, draggedInner: null, draggedInnerNewType: null, innerDropTarget: null });
  }, []);

  // Block operations
  const addBlock = useCallback((type: BlockType, atIndex?: number) => {
    const layout = COLUMN_LAYOUTS[0];
    const newBlock: EmailBlock = {
      id: Date.now().toString(),
      type,
      content: { ...defaultContent[type] || {} },
      ...(type === "columns" ? { columns: layout.widths.map(() => []) } : {}),
    };
    setBlocksWithHistory(prev => {
      const newBlocks = [...prev];
      if (atIndex !== undefined) newBlocks.splice(atIndex, 0, newBlock);
      else newBlocks.push(newBlock);
      return newBlocks;
    });
    setSelectedBlock(newBlock.id);
    setSelectedInner(null);
  }, [setBlocksWithHistory]);

  const updateBlock = useCallback((id: string, content: Record<string, string>) => {
    setBlocksWithHistory(prev => prev.map(b => b.id === id ? { ...b, content } : b));
  }, [setBlocksWithHistory]);

  const removeBlock = useCallback((id: string) => {
    setBlocksWithHistory(prev => prev.filter(b => b.id !== id));
    if (selectedBlock === id) { setSelectedBlock(null); setSelectedInner(null); }
  }, [setBlocksWithHistory, selectedBlock]);

  const duplicateBlock = useCallback((id: string) => {
    setBlocksWithHistory(prev => {
      const idx = prev.findIndex(b => b.id === id);
      if (idx === -1) return prev;
      const original = prev[idx];
      const clone: EmailBlock = JSON.parse(JSON.stringify(original));
      clone.id = Date.now().toString();
      if (clone.columns) {
        clone.columns = clone.columns.map(col => col.map(inner => ({ ...inner, id: Date.now().toString() + Math.random() })));
      }
      const newBlocks = [...prev];
      newBlocks.splice(idx + 1, 0, clone);
      return newBlocks;
    });
  }, [setBlocksWithHistory]);

  const moveBlock = useCallback((fromIndex: number, toIndex: number) => {
    setBlocksWithHistory(prev => {
      const newBlocks = [...prev];
      const [moved] = newBlocks.splice(fromIndex, 1);
      const adjusted = toIndex > fromIndex ? toIndex - 1 : toIndex;
      newBlocks.splice(adjusted, 0, moved);
      return newBlocks;
    });
  }, [setBlocksWithHistory]);

  // Change column layout
  const changeColumnLayout = useCallback((blockId: string, layoutValue: string) => {
    const layout = COLUMN_LAYOUTS.find(l => l.value === layoutValue);
    if (!layout) return;
    setBlocksWithHistory(prev => prev.map(b => {
      if (b.id !== blockId) return b;
      const existingCols = b.columns || [];
      const newCols: InnerBlock[][] = layout.widths.map((_, i) => existingCols[i] || []);
      return { ...b, content: { ...b.content, layout: layoutValue }, columns: newCols };
    }));
  }, [setBlocksWithHistory]);

  // Inner block operations
  const addInnerBlock = useCallback((blockId: string, colIndex: number, type: InnerBlockType, atIndex?: number) => {
    const newInner: InnerBlock = { id: Date.now().toString() + Math.random(), type, content: { ...defaultContent[type] || {} } };
    setBlocksWithHistory(prev => prev.map(b => {
      if (b.id !== blockId || !b.columns) return b;
      const newCols = b.columns.map((col, ci) => {
        if (ci !== colIndex) return col;
        const newCol = [...col];
        if (atIndex !== undefined) newCol.splice(atIndex, 0, newInner);
        else newCol.push(newInner);
        return newCol;
      });
      return { ...b, columns: newCols };
    }));
    setSelectedInner({ blockId, colIndex, innerId: newInner.id });
    setSelectedBlock(null);
  }, [setBlocksWithHistory]);

  const updateInnerBlock = useCallback((blockId: string, colIndex: number, innerId: string, content: Record<string, string>) => {
    setBlocksWithHistory(prev => prev.map(b => {
      if (b.id !== blockId || !b.columns) return b;
      const newCols = b.columns.map((col, ci) => {
        if (ci !== colIndex) return col;
        return col.map(inner => inner.id === innerId ? { ...inner, content } : inner);
      });
      return { ...b, columns: newCols };
    }));
  }, [setBlocksWithHistory]);

  const removeInnerBlock = useCallback((blockId: string, colIndex: number, innerId: string) => {
    setBlocksWithHistory(prev => prev.map(b => {
      if (b.id !== blockId || !b.columns) return b;
      const newCols = b.columns.map((col, ci) => ci !== colIndex ? col : col.filter(inner => inner.id !== innerId));
      return { ...b, columns: newCols };
    }));
    if (selectedInner?.innerId === innerId) setSelectedInner(null);
  }, [setBlocksWithHistory, selectedInner]);

  const duplicateInnerBlock = useCallback((blockId: string, colIndex: number, innerId: string) => {
    setBlocksWithHistory(prev => prev.map(b => {
      if (b.id !== blockId || !b.columns) return b;
      const newCols = b.columns.map((col, ci) => {
        if (ci !== colIndex) return col;
        const idx = col.findIndex(i => i.id === innerId);
        if (idx === -1) return col;
        const clone = { ...col[idx], id: Date.now().toString() + Math.random(), content: { ...col[idx].content } };
        const newCol = [...col];
        newCol.splice(idx + 1, 0, clone);
        return newCol;
      });
      return { ...b, columns: newCols };
    }));
  }, [setBlocksWithHistory]);

  // Drag handlers
  const handleSidebarDragStart = useCallback((e: React.DragEvent, type: BlockType) => {
    setDragState({ draggedBlockId: null, draggedNewType: type, dropIndex: null, draggedInner: null, draggedInnerNewType: null, innerDropTarget: null });
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("text/plain", type);
  }, []);

  const handleBlockDragStart = useCallback((e: React.DragEvent, blockId: string) => {
    e.stopPropagation();
    setDragState(prev => ({ ...prev, draggedBlockId: blockId, draggedNewType: null, draggedInner: null, draggedInnerNewType: null }));
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", blockId);
  }, []);

  const handleInnerBlockDragStart = useCallback((e: React.DragEvent, blockId: string, colIndex: number, innerId: string) => {
    e.stopPropagation();
    setDragState(prev => ({ ...prev, draggedInner: { blockId, colIndex, innerId }, draggedBlockId: null, draggedNewType: null, draggedInnerNewType: null }));
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", innerId);
  }, []);

  const handleCanvasDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (dragState.draggedInner || dragState.draggedInnerNewType) return;
    e.dataTransfer.dropEffect = dragState.draggedNewType ? "copy" : "move";
    const canvas = canvasRef.current;
    if (!canvas) return;
    const blockElements = canvas.querySelectorAll("[data-block-id]");
    let newDropIndex = blocks.length;
    for (let i = 0; i < blockElements.length; i++) {
      const rect = blockElements[i].getBoundingClientRect();
      if (e.clientY < rect.top + rect.height / 2) { newDropIndex = i; break; }
    }
    setDragState(prev => ({ ...prev, dropIndex: newDropIndex }));
  }, [blocks.length, dragState.draggedNewType, dragState.draggedInner, dragState.draggedInnerNewType]);

  const handleCanvasDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (dragState.draggedInner || dragState.draggedInnerNewType) return;
    const targetIndex = dragState.dropIndex ?? blocks.length;
    if (dragState.draggedNewType) {
      addBlock(dragState.draggedNewType, targetIndex);
    } else if (dragState.draggedBlockId) {
      const fromIndex = blocks.findIndex(b => b.id === dragState.draggedBlockId);
      if (fromIndex !== -1) moveBlock(fromIndex, targetIndex);
    }
    resetDragState();
  }, [dragState, blocks, addBlock, moveBlock, resetDragState]);

  const handleColumnDragOver = useCallback((e: React.DragEvent, blockId: string, colIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    const isInnerDrag = !!dragState.draggedInner;
    const isNewType = dragState.draggedNewType && dragState.draggedNewType !== "columns" && dragState.draggedNewType !== "divider";
    if (!isInnerDrag && !isNewType) return;
    e.dataTransfer.dropEffect = isInnerDrag ? "move" : "copy";
    const block = blocks.find(b => b.id === blockId);
    if (!block?.columns) return;
    const col = block.columns[colIndex];
    const target = e.currentTarget as HTMLElement;
    const innerEls = target.querySelectorAll("[data-inner-id]");
    let newIndex = col.length;
    for (let i = 0; i < innerEls.length; i++) {
      const rect = innerEls[i].getBoundingClientRect();
      if (e.clientY < rect.top + rect.height / 2) { newIndex = i; break; }
    }
    setDragState(prev => ({ ...prev, innerDropTarget: { blockId, colIndex, innerIndex: newIndex }, dropIndex: null }));
  }, [blocks, dragState.draggedInner, dragState.draggedNewType]);

  const handleColumnDrop = useCallback((e: React.DragEvent, blockId: string, colIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    const targetIdx = dragState.innerDropTarget?.innerIndex ?? 0;
    if (dragState.draggedInner) {
      setBlocksWithHistory(prev => {
        const newBlocks = prev.map(b => {
          if (b.id !== dragState.draggedInner!.blockId && b.id !== blockId) return b;
          return { ...b, columns: b.columns?.map(col => [...col]) };
        });
        const srcBlock = newBlocks.find(b => b.id === dragState.draggedInner!.blockId);
        if (!srcBlock?.columns) return prev;
        const srcCol = srcBlock.columns[dragState.draggedInner!.colIndex];
        const srcIdx = srcCol.findIndex(i => i.id === dragState.draggedInner!.innerId);
        if (srcIdx === -1) return prev;
        const [moved] = srcCol.splice(srcIdx, 1);
        const tgtBlock = newBlocks.find(b => b.id === blockId);
        if (!tgtBlock?.columns) return prev;
        const tgtCol = tgtBlock.columns[colIndex];
        const adj = (dragState.draggedInner!.blockId === blockId && dragState.draggedInner!.colIndex === colIndex && targetIdx > srcIdx) ? targetIdx - 1 : targetIdx;
        tgtCol.splice(adj, 0, moved);
        return newBlocks;
      });
    } else if (dragState.draggedNewType && dragState.draggedNewType !== "columns" && dragState.draggedNewType !== "divider") {
      addInnerBlock(blockId, colIndex, dragState.draggedNewType as InnerBlockType, targetIdx);
    }
    resetDragState();
  }, [dragState, setBlocksWithHistory, addInnerBlock, resetDragState]);

  const handleCanvasDragLeave = useCallback((e: React.DragEvent) => {
    if (canvasRef.current && !canvasRef.current.contains(e.relatedTarget as Node)) {
      setDragState(prev => ({ ...prev, dropIndex: null }));
    }
  }, []);

  // Load template
  const loadTemplate = useCallback((templateBlocks: EmailBlock[], styles?: Partial<GlobalEmailStyles>) => {
    // Re-generate IDs
    const reId = (blocks: EmailBlock[]): EmailBlock[] =>
      blocks.map(b => ({
        ...b,
        id: Date.now().toString() + Math.random(),
        columns: b.columns?.map(col => col.map(inner => ({ ...inner, id: Date.now().toString() + Math.random() }))),
      }));
    const newBlocks = reId(templateBlocks);
    setBlocksWithHistory(newBlocks);
    if (styles) setGlobalStyles(prev => ({ ...prev, ...styles }));
    setShowTemplateSelector(false);
    setSelectedBlock(null);
    setSelectedInner(null);
  }, [setBlocksWithHistory]);

  return {
    blocks, setBlocks: setBlocksWithHistory, selectedBlock, setSelectedBlock, selectedInner, setSelectedInner,
    subject, setSubject, previewName, setPreviewName, activeTab, setActiveTab,
    globalStyles, setGlobalStyles, previewMode, setPreviewMode,
    showTemplateSelector, setShowTemplateSelector,
    dragState, canvasRef, resetDragState,
    addBlock, updateBlock, removeBlock, duplicateBlock, moveBlock, changeColumnLayout,
    addInnerBlock, updateInnerBlock, removeInnerBlock, duplicateInnerBlock,
    handleSidebarDragStart, handleBlockDragStart, handleInnerBlockDragStart,
    handleCanvasDragOver, handleCanvasDrop, handleColumnDragOver, handleColumnDrop, handleCanvasDragLeave,
    undo, redo, canUndo: historyIndex > 0, canRedo: historyIndex < history.length - 1,
    loadTemplate,
  };
}
