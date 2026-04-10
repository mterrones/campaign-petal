import { useState, useEffect } from "react";
import { ArrowLeft, Save, Send, GripVertical, Trash2, Copy, Undo2, Redo2, Download, Monitor, Smartphone, Settings, Code } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

import { useEmailEditor } from "@/components/email-editor/useEmailEditor";
import { BlockSidebar } from "@/components/email-editor/BlockSidebar";
import { BlockRenderer } from "@/components/email-editor/BlockRenderer";
import { PropertiesPanel } from "@/components/email-editor/PropertiesPanel";
import { GlobalStyles } from "@/components/email-editor/GlobalStyles";
import { TemplateSelector } from "@/components/email-editor/TemplateSelector";
import { exportHtml } from "@/components/email-editor/htmlExport";

const EmailEditor = () => {
  const editor = useEmailEditor();
  const [htmlCode, setHtmlCode] = useState("");
  const [htmlDirty, setHtmlDirty] = useState(false);

  const selectedBlockData = editor.blocks.find(b => b.id === editor.selectedBlock) || null;
  const selectedInnerData = editor.selectedInner
    ? editor.blocks.find(b => b.id === editor.selectedInner!.blockId)?.columns?.[editor.selectedInner!.colIndex]?.find(i => i.id === editor.selectedInner!.innerId) || null
    : null;

  // Sync HTML code when switching to code tab
  useEffect(() => {
    if (editor.activeTab === "code") {
      const html = exportHtml(editor.blocks, editor.globalStyles, editor.subject);
      setHtmlCode(html);
      setHtmlDirty(false);
    }
  }, [editor.activeTab]);

  const handleApplyHtml = () => {
    // Replace all blocks with a single HTML block containing the full code
    const newBlock = {
      id: Date.now().toString() + Math.random(),
      type: "html" as const,
      content: { code: htmlCode },
    };
    editor.setBlocks([newBlock]);
    editor.setActiveTab("edit");
    editor.setSelectedBlock(newBlock.id);
    toast.success("HTML aplicado al editor");
    setHtmlDirty(false);
  };
  const handleExportHtml = () => {
    const html = exportHtml(editor.blocks, editor.globalStyles, editor.subject);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${editor.previewName || "email"}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("HTML exportado correctamente");
  };

  const handleCopyHtml = () => {
    const html = exportHtml(editor.blocks, editor.globalStyles, editor.subject);
    navigator.clipboard.writeText(html);
    toast.success("HTML copiado al portapapeles");
  };

  if (editor.showTemplateSelector) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Link to="/campaigns">
            <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
          </Link>
          <h1 className="text-lg font-bold">Nuevo Email</h1>
        </div>
        <TemplateSelector
          onSelect={(blocks, styles) => editor.loadTemplate(blocks, styles)}
          onSkip={() => editor.setShowTemplateSelector(false)}
        />
      </div>
    );
  }

  const DropIndicator = () => (
    <div className="h-1 bg-primary rounded-full mx-2 my-1 transition-all animate-pulse" />
  );

  return (
    <div className="space-y-3">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/campaigns">
            <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
          </Link>
          <Input
            value={editor.previewName}
            onChange={e => editor.setPreviewName(e.target.value)}
            className="text-lg font-bold border-none shadow-none p-0 h-auto focus-visible:ring-0 w-64"
            placeholder="Nombre de la campaña"
          />
        </div>
        <div className="flex gap-1.5 items-center">
          <Button variant="ghost" size="icon" onClick={editor.undo} disabled={!editor.canUndo} title="Deshacer (Ctrl+Z)">
            <Undo2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={editor.redo} disabled={!editor.canRedo} title="Rehacer (Ctrl+Y)">
            <Redo2 className="w-4 h-4" />
          </Button>
          <div className="w-px h-6 bg-border mx-1" />
          <Button variant="outline" size="sm" onClick={handleCopyHtml}><Copy className="w-3.5 h-3.5 mr-1.5" />Copiar HTML</Button>
          <Button variant="outline" size="sm" onClick={handleExportHtml}><Download className="w-3.5 h-3.5 mr-1.5" />Exportar</Button>
          <Button variant="outline" size="sm"><Save className="w-3.5 h-3.5 mr-1.5" />Guardar</Button>
          <Button size="sm"><Send className="w-3.5 h-3.5 mr-1.5" />Enviar</Button>
        </div>
      </div>

      <div className="flex gap-3 items-start">
        {/* Sidebar blocks */}
        <BlockSidebar onDragStart={editor.handleSidebarDragStart} onDragEnd={editor.resetDragState} />

        {/* Main area */}
        <div className="flex-1 min-w-0">
          <Tabs value={editor.activeTab} onValueChange={editor.setActiveTab}>
            <div className="flex items-center justify-between mb-3">
              <TabsList>
                <TabsTrigger value="edit">Editar</TabsTrigger>
                <TabsTrigger value="preview">Vista Previa</TabsTrigger>
              </TabsList>
              {editor.activeTab === "preview" && (
                <div className="flex gap-1 bg-muted rounded-md p-0.5">
                  <Button variant={editor.previewMode === "desktop" ? "default" : "ghost"} size="sm" className="h-7 px-2" onClick={() => editor.setPreviewMode("desktop")}>
                    <Monitor className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant={editor.previewMode === "mobile" ? "default" : "ghost"} size="sm" className="h-7 px-2" onClick={() => editor.setPreviewMode("mobile")}>
                    <Smartphone className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </div>

            <TabsContent value="edit">
              {/* Subject */}
              <div className="bg-card rounded-xl border shadow-sm p-3 mb-3">
                <Label className="text-xs text-muted-foreground">Asunto del Email</Label>
                <Input value={editor.subject} onChange={e => editor.setSubject(e.target.value)} className="mt-1 h-8" placeholder="Asunto..." />
              </div>

              {/* Canvas */}
              <div
                ref={editor.canvasRef}
                onDragOver={editor.handleCanvasDragOver}
                onDrop={editor.handleCanvasDrop}
                onDragLeave={editor.handleCanvasDragLeave}
                className={`bg-card rounded-xl border shadow-sm transition-colors min-h-[400px] ${
                  (editor.dragState.draggedNewType || editor.dragState.draggedBlockId) && !editor.dragState.draggedInner ? "border-primary/40 border-dashed" : ""
                }`}
                style={{ backgroundColor: editor.globalStyles.bodyBgColor }}
              >
                <div style={{ maxWidth: `${editor.globalStyles.emailWidth}px`, margin: "0 auto", padding: `${editor.globalStyles.padding}px 24px`, backgroundColor: editor.globalStyles.contentBgColor, fontFamily: editor.globalStyles.fontFamily }}>
                  {editor.blocks.length === 0 && !editor.dragState.draggedNewType && !editor.dragState.draggedBlockId && (
                    <div className="py-20 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                      <GripVertical className="w-8 h-8 mx-auto mb-3 opacity-40" />
                      <p className="text-sm font-medium">Arrastra bloques aquí</p>
                      <p className="text-xs mt-1">Usa los bloques del panel izquierdo</p>
                    </div>
                  )}

                  {editor.blocks.map((block, index) => (
                    <div key={block.id}>
                      {editor.dragState.dropIndex === index && <DropIndicator />}
                      <div
                        data-block-id={block.id}
                        draggable
                        onDragStart={e => editor.handleBlockDragStart(e, block.id)}
                        onDragEnd={editor.resetDragState}
                        onClick={() => { editor.setSelectedBlock(block.id); editor.setSelectedInner(null); }}
                        className={`group relative rounded-lg transition-all cursor-pointer ${
                          editor.dragState.draggedBlockId === block.id ? "opacity-30" : ""
                        } ${
                          editor.selectedBlock === block.id ? "ring-2 ring-primary shadow-sm" : "hover:ring-1 hover:ring-border"
                        }`}
                      >
                        {/* Drag handle */}
                        <div className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                          <div className="bg-card border rounded-md p-0.5 shadow-sm">
                            <GripVertical className="w-4 h-4 text-muted-foreground" />
                          </div>
                        </div>

                        <BlockRenderer
                          block={block}
                          globalStyles={editor.globalStyles}
                          selectedBlock={editor.selectedBlock}
                          selectedInner={editor.selectedInner}
                          draggedBlockId={editor.dragState.draggedBlockId}
                          draggedInner={editor.dragState.draggedInner}
                          innerDropTarget={editor.dragState.innerDropTarget}
                          previewMode={editor.previewMode}
                          onBlockDragStart={editor.handleBlockDragStart}
                          onInnerBlockDragStart={editor.handleInnerBlockDragStart}
                          onColumnDragOver={editor.handleColumnDragOver}
                          onColumnDrop={editor.handleColumnDrop}
                          onSelectBlock={id => { editor.setSelectedBlock(id); editor.setSelectedInner(null); }}
                          onSelectInner={data => { editor.setSelectedInner(data); editor.setSelectedBlock(null); }}
                          onRemoveBlock={editor.removeBlock}
                          onDuplicateBlock={editor.duplicateBlock}
                          onRemoveInnerBlock={editor.removeInnerBlock}
                          onDuplicateInnerBlock={editor.duplicateInnerBlock}
                          onAddInnerBlock={editor.addInnerBlock}
                          onResetDrag={editor.resetDragState}
                        />

                        {/* Action buttons */}
                        <div className="absolute -right-3 -top-3 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={e => { e.stopPropagation(); editor.duplicateBlock(block.id); }} className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
                            <Copy className="w-3 h-3" />
                          </button>
                          <button onClick={e => { e.stopPropagation(); editor.removeBlock(block.id); }} className="w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {editor.dragState.dropIndex === editor.blocks.length && editor.blocks.length > 0 && <DropIndicator />}

                  {editor.blocks.length === 0 && (editor.dragState.draggedNewType || editor.dragState.draggedBlockId) && (
                    <div className="py-16 text-center text-primary border-2 border-primary/30 border-dashed rounded-xl bg-primary/5">
                      <p className="text-sm font-medium">Suelta aquí para agregar</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preview">
              <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                <div className="bg-muted px-4 py-2 border-b flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-destructive/50" />
                    <span className="w-3 h-3 rounded-full bg-warning/50" />
                    <span className="w-3 h-3 rounded-full bg-success/50" />
                  </div>
                  <span className="text-xs text-muted-foreground ml-2">Vista previa — {editor.previewMode === "desktop" ? "Desktop" : "Mobile"}</span>
                </div>
                <div className="p-4" style={{ backgroundColor: editor.globalStyles.bodyBgColor }}>
                  <div className="bg-card rounded-lg p-3 mb-4 border text-sm" style={{ maxWidth: editor.previewMode === "mobile" ? "375px" : `${editor.globalStyles.emailWidth}px`, margin: "0 auto" }}>
                    <p><strong>De:</strong> {editor.globalStyles.senderName} &lt;{editor.globalStyles.senderEmail}&gt;</p>
                    <p><strong>Asunto:</strong> {editor.subject}</p>
                    {editor.globalStyles.preheaderText && <p className="text-muted-foreground text-xs mt-1">{editor.globalStyles.preheaderText}</p>}
                  </div>
                  <div style={{
                    maxWidth: editor.previewMode === "mobile" ? "375px" : `${editor.globalStyles.emailWidth}px`,
                    margin: "0 auto",
                    padding: `${editor.globalStyles.padding}px 24px`,
                    backgroundColor: editor.globalStyles.contentBgColor,
                    borderRadius: "12px",
                    border: "1px solid hsl(214, 32%, 91%)",
                    fontFamily: editor.globalStyles.fontFamily,
                  }}>
                    {editor.blocks.map(block => (
                      <BlockRenderer
                        key={block.id}
                        block={block}
                        isPreview
                        globalStyles={editor.globalStyles}
                        selectedBlock={null}
                        selectedInner={null}
                        draggedBlockId={null}
                        draggedInner={null}
                        innerDropTarget={null}
                        previewMode={editor.previewMode}
                        onBlockDragStart={() => {}}
                        onInnerBlockDragStart={() => {}}
                        onColumnDragOver={() => {}}
                        onColumnDrop={() => {}}
                        onSelectBlock={() => {}}
                        onSelectInner={() => {}}
                        onRemoveBlock={() => {}}
                        onDuplicateBlock={() => {}}
                        onRemoveInnerBlock={() => {}}
                        onDuplicateInnerBlock={() => {}}
                        onAddInnerBlock={() => {}}
                        onResetDrag={() => {}}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right panel */}
        <div className="w-72 sticky top-8">
          <ScrollArea className="h-[calc(100vh-120px)]">
            <Tabs defaultValue="properties">
              <TabsList className="w-full mb-3">
                <TabsTrigger value="properties" className="flex-1 text-xs">Propiedades</TabsTrigger>
                <TabsTrigger value="global" className="flex-1 text-xs"><Settings className="w-3 h-3 mr-1" />Global</TabsTrigger>
              </TabsList>
              <TabsContent value="properties">
                <div className="bg-card rounded-xl border shadow-sm p-4">
                  <h3 className="font-semibold text-sm mb-4">Propiedades</h3>
                  <PropertiesPanel
                    selectedBlock={selectedBlockData}
                    selectedInnerData={selectedInnerData || null}
                    selectedInner={editor.selectedInner}
                    onUpdateBlock={editor.updateBlock}
                    onUpdateInnerBlock={editor.updateInnerBlock}
                    onChangeColumnLayout={editor.changeColumnLayout}
                  />
                </div>
              </TabsContent>
              <TabsContent value="global">
                <div className="bg-card rounded-xl border shadow-sm p-4">
                  <GlobalStyles styles={editor.globalStyles} onChange={editor.setGlobalStyles} />
                </div>
              </TabsContent>
            </Tabs>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default EmailEditor;
