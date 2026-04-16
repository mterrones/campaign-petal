import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, Send, GripVertical, Trash2, Copy, Undo2, Redo2, Download, Monitor, Smartphone, Settings, Code, PanelRight, LayoutGrid } from "lucide-react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { emailTemplates } from "@/components/email-editor/templates";
import {
  getUserTemplate,
  saveUserTemplate,
} from "@/lib/userTemplates";
import { useAuth } from "@/context/AuthContext";
import { ApiError, patchJson, postJson } from "@/lib/api";
import {
  platformCampaignMessagesQueryKey,
  platformCampaignQueryKey,
  platformCampaignsQueryKey,
  type PlatformCampaign,
} from "@/lib/platformCampaigns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";

import { useEmailEditor } from "@/components/email-editor/useEmailEditor";
import { BlockSidebar } from "@/components/email-editor/BlockSidebar";
import { BlockRenderer } from "@/components/email-editor/BlockRenderer";
import { PropertiesPanel } from "@/components/email-editor/PropertiesPanel";
import { GlobalStyles } from "@/components/email-editor/GlobalStyles";
import { TemplateSelector } from "@/components/email-editor/TemplateSelector";
import { exportHtml } from "@/components/email-editor/htmlExport";
import { defaultDirectories } from "@/data/mockData";
import {
  countActiveEmailsForAgenda,
  getActiveEmailsForAgenda,
} from "@/lib/contactLists";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SendEmailResponse = {
  id: string;
  deliveryStatus: string;
  errorDetail?: string | null;
};

type CreateCampaignResponse = {
  campaign: PlatformCampaign;
};

type PatchCampaignResponse = {
  campaign: PlatformCampaign;
};

type SendBulkResponse = {
  succeeded: number;
  failed: { email: string; error: string }[];
  attempted: number;
};

const EmailEditor = () => {
  const editor = useEmailEditor();
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();

  // Mode: template editor vs campaign editor
  const isTemplateMode = location.pathname.startsWith("/templates/");
  const editingTemplateId = isTemplateMode ? params.id ?? null : null;

  const campaignInitRef = useRef(false);
  const templateLoadRef = useRef(false);
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [savedTemplateId, setSavedTemplateId] = useState<string | null>(editingTemplateId);
  const [saveTplDialogOpen, setSaveTplDialogOpen] = useState(false);
  const [tplDescription, setTplDescription] = useState("");
  const [tplSubmitting, setTplSubmitting] = useState(false);

  const isMobile = useIsMobile();
  const [htmlCode, setHtmlCode] = useState("");
  const [htmlDirty, setHtmlDirty] = useState(false);
  const [showBlocks, setShowBlocks] = useState(false);
  const [showProps, setShowProps] = useState(false);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [sendStep, setSendStep] = useState<"test" | "agenda">("test");
  const [sendTo, setSendTo] = useState("");
  const [sendSubject, setSendSubject] = useState("");
  const [selectedAgendaId, setSelectedAgendaId] = useState("all");
  const [sendSubmitting, setSendSubmitting] = useState(false);

  const selectedBlockData = editor.blocks.find(b => b.id === editor.selectedBlock) || null;
  const selectedInnerData = editor.selectedInner
    ? editor.blocks.find(b => b.id === editor.selectedInner!.blockId)?.columns?.[editor.selectedInner!.colIndex]?.find(i => i.id === editor.selectedInner!.innerId) || null
    : null;

  // Preload template (from URL param or template being edited) and skip the selector.
  useEffect(() => {
    if (templateLoadRef.current) return;
    const templateParam = searchParams.get("template");

    if (isTemplateMode) {
      templateLoadRef.current = true;
      if (editingTemplateId) {
        const tpl = getUserTemplate(editingTemplateId);
        if (tpl) {
          editor.setPreviewName(tpl.name);
          editor.setSubject(tpl.subject || tpl.name);
          setTplDescription(tpl.description || "");
          editor.loadTemplate(tpl.blocks, tpl.globalStyles);
        } else {
          toast.error("Plantilla no encontrada");
          navigate("/templates", { replace: true });
        }
      } else {
        // /templates/new — start blank without showing the selector
        editor.setPreviewName("Plantilla sin título");
        editor.loadTemplate([], {});
      }
      return;
    }

    // Campaign mode — handle ?template=blank|builtin:id|user:id
    if (templateParam) {
      templateLoadRef.current = true;
      if (templateParam === "blank") {
        editor.loadTemplate([], {});
      } else if (templateParam.startsWith("user:")) {
        const id = templateParam.slice(5);
        const tpl = getUserTemplate(id);
        if (tpl) {
          editor.setSubject(tpl.subject || editor.subject);
          editor.setPreviewName(tpl.name);
          editor.loadTemplate(tpl.blocks, tpl.globalStyles);
        } else {
          toast.error("Plantilla no encontrada");
          editor.loadTemplate([], {});
        }
      } else if (templateParam.startsWith("builtin:")) {
        const id = templateParam.slice(8);
        const tpl = emailTemplates.find((t) => t.id === id);
        if (tpl) {
          editor.loadTemplate(tpl.blocks, tpl.globalStyles);
        } else {
          editor.loadTemplate([], {});
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!token || editor.showTemplateSelector) return;
    if (campaignInitRef.current) return;
    campaignInitRef.current = true;
    const subjectLine = editor.subject.trim();
    const displayName = subjectLine || "Untitled";
    void postJson<CreateCampaignResponse>(
      "/v1/platform/campaigns",
      { name: displayName, subject: subjectLine },
      { token },
    )
      .then((res) => setCampaignId(res.campaign.id))
      .catch(() => {
        campaignInitRef.current = false;
        toast.error("No se pudo preparar la campaña");
      });
  }, [token, editor.showTemplateSelector]);

  useEffect(() => {
    if (!token || !campaignId) return;
    const handle = window.setTimeout(() => {
      void patchJson<PatchCampaignResponse>(
        `/v1/platform/campaigns/${campaignId}`,
        { subject: editor.subject },
        { token },
      )
        .then(() => {
          void queryClient.invalidateQueries({ queryKey: platformCampaignsQueryKey });
          void queryClient.invalidateQueries({ queryKey: platformCampaignQueryKey(campaignId) });
        })
        .catch(() => {});
    }, 500);
    return () => window.clearTimeout(handle);
  }, [editor.subject, campaignId, token, queryClient]);

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

  const buildHtmlForSend = (subjectLine: string) => {
    if (editor.activeTab === "code" && htmlDirty && htmlCode.trim()) {
      return htmlCode.trim();
    }
    return exportHtml(editor.blocks, editor.globalStyles, subjectLine);
  };

  const openSendDialog = () => {
    setSendStep("test");
    setSendSubject(editor.subject.trim());
    setSendTo("");
    setSelectedAgendaId("all");
    setSendDialogOpen(true);
  };

  const invalidateCampaignQueries = () => {
    void queryClient.invalidateQueries({ queryKey: platformCampaignsQueryKey });
    if (campaignId) {
      void queryClient.invalidateQueries({ queryKey: platformCampaignQueryKey(campaignId) });
      void queryClient.invalidateQueries({ queryKey: platformCampaignMessagesQueryKey(campaignId) });
    }
  };

  const handleSendTest = async () => {
    const to = sendTo.trim();
    const subject = sendSubject.trim();
    if (!token) {
      toast.error("Inicia sesión para enviar");
      return;
    }
    if (!to || !subject) {
      toast.error("Indica email de prueba y asunto");
      return;
    }
    const html = buildHtmlForSend(subject);
    if (!html) {
      toast.error("No hay contenido para enviar");
      return;
    }
    setSendSubmitting(true);
    try {
      const res = await postJson<SendEmailResponse>(
        "/v1/platform/send-email",
        {
          to,
          subject,
          html,
          ...(campaignId ? { campaignId } : {}),
        },
        { token },
      );
      if (res.deliveryStatus === "sent") {
        invalidateCampaignQueries();
        toast.success("Prueba enviada. Continúa con la agenda.");
        setSendStep("agenda");
      } else {
        toast.error(res.errorDetail || "No se pudo completar el envío (SMTP)");
      }
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.status === 429) {
          toast.error("Demasiados envíos seguidos. Espera un momento.");
        } else if (e.status === 502) {
          const body = e.body as SendEmailResponse | { error?: string };
          const detail =
            typeof body === "object" && body && "errorDetail" in body
              ? (body as SendEmailResponse).errorDetail
              : null;
          toast.error(detail || "Error al entregar el correo");
        } else {
          toast.error("No se pudo enviar la prueba");
        }
      } else {
        toast.error("Error de red al enviar");
      }
    } finally {
      setSendSubmitting(false);
    }
  };

  const handleBulkSend = async () => {
    const subject = sendSubject.trim();
    if (!token) {
      toast.error("Inicia sesión para enviar");
      return;
    }
    if (!subject) {
      toast.error("Indica el asunto");
      return;
    }
    const recipients = getActiveEmailsForAgenda(selectedAgendaId);
    if (recipients.length === 0) {
      toast.error("No hay contactos activos en esta agenda");
      return;
    }
    const html = buildHtmlForSend(subject);
    if (!html) {
      toast.error("No hay contenido para enviar");
      return;
    }
    setSendSubmitting(true);
    try {
      const res = await postJson<SendBulkResponse>(
        "/v1/platform/send-bulk",
        {
          to: recipients,
          subject,
          html,
          ...(campaignId ? { campaignId } : {}),
        },
        { token },
      );
      invalidateCampaignQueries();
      if (res.failed.length === 0) {
        toast.success(`Enviado a ${res.succeeded} destinatario(s)`);
      } else {
        toast.warning(
          `Enviados: ${res.succeeded}, fallidos: ${res.failed.length}${
            res.succeeded === 0 ? ". Revisa SMTP o destinatarios." : ""
          }`,
        );
      }
      setSendDialogOpen(false);
      setSendStep("test");
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.status === 429) {
          toast.error("Límite de envíos masivos. Espera unos minutos.");
        } else {
          toast.error("No se pudo completar el envío masivo");
        }
      } else {
        toast.error("Error de red al enviar");
      }
    } finally {
      setSendSubmitting(false);
    }
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
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Link to="/campaigns">
            <Button variant="ghost" size="icon" className="shrink-0"><ArrowLeft className="w-4 h-4" /></Button>
          </Link>
          <Input
            value={editor.previewName}
            onChange={e => editor.setPreviewName(e.target.value)}
            className="text-base sm:text-lg font-bold border-none shadow-none p-0 h-auto focus-visible:ring-0 w-full max-w-[200px] sm:max-w-[300px]"
            placeholder="Nombre de la campaña"
          />
        </div>
        <div className="flex gap-1 items-center shrink-0">
          <Button variant="ghost" size="icon" onClick={editor.undo} disabled={!editor.canUndo} title="Deshacer">
            <Undo2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={editor.redo} disabled={!editor.canRedo} title="Rehacer">
            <Redo2 className="w-4 h-4" />
          </Button>
          {isMobile && (
            <>
              <Button variant="ghost" size="icon" onClick={() => setShowBlocks(true)} title="Bloques">
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setShowProps(true)} title="Propiedades">
                <PanelRight className="w-4 h-4" />
              </Button>
            </>
          )}
          <div className="hidden sm:flex gap-1.5 items-center">
            <div className="w-px h-6 bg-border mx-1" />
            <Button variant="outline" size="sm" onClick={handleCopyHtml}><Copy className="w-3.5 h-3.5 mr-1.5" />Copiar HTML</Button>
            <Button variant="outline" size="sm" onClick={handleExportHtml}><Download className="w-3.5 h-3.5 mr-1.5" />Exportar</Button>
            <Button variant="outline" size="sm"><Save className="w-3.5 h-3.5 mr-1.5" />Guardar</Button>
            <Button size="sm" onClick={openSendDialog}>
              <Send className="w-3.5 h-3.5 mr-1.5" />Enviar
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile action buttons */}
      {isMobile && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          <Button variant="outline" size="sm" onClick={handleCopyHtml}><Copy className="w-3.5 h-3.5 mr-1" />Copiar</Button>
          <Button variant="outline" size="sm" onClick={handleExportHtml}><Download className="w-3.5 h-3.5 mr-1" />Exportar</Button>
          <Button variant="outline" size="sm"><Save className="w-3.5 h-3.5 mr-1" />Guardar</Button>
          <Button size="sm" onClick={openSendDialog}>
            <Send className="w-3.5 h-3.5 mr-1" />Enviar
          </Button>
        </div>
      )}

      <div className="flex gap-3 items-start">
        {/* Sidebar blocks - desktop */}
        {!isMobile && (
          <BlockSidebar onDragStart={editor.handleSidebarDragStart} onDragEnd={editor.resetDragState} />
        )}

        {/* Mobile blocks drawer */}
        {isMobile && (
          <Sheet open={showBlocks} onOpenChange={setShowBlocks}>
            <SheetContent side="left" className="w-[140px] p-3">
              <SheetTitle className="sr-only">Bloques</SheetTitle>
              <BlockSidebar onDragStart={editor.handleSidebarDragStart} onDragEnd={editor.resetDragState} />
            </SheetContent>
          </Sheet>
        )}

        {/* Main area */}
        <div className="flex-1 min-w-0">
          <Tabs value={editor.activeTab} onValueChange={editor.setActiveTab}>
            <div className="flex items-center justify-between mb-3">
              <TabsList>
                <TabsTrigger value="edit">Editar</TabsTrigger>
                <TabsTrigger value="preview">Vista Previa</TabsTrigger>
                <TabsTrigger value="code"><Code className="w-3.5 h-3.5 mr-1" />HTML</TabsTrigger>
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

            <TabsContent value="code">
              <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                <div className="flex items-center justify-between bg-muted px-4 py-2 border-b">
                  <span className="text-xs text-muted-foreground font-medium">Editor HTML</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => {
                      navigator.clipboard.writeText(htmlCode);
                      toast.success("HTML copiado");
                    }}>
                      <Copy className="w-3 h-3 mr-1" />Copiar
                    </Button>
                    <Button size="sm" className="h-7 text-xs" disabled={!htmlDirty} onClick={handleApplyHtml}>
                      Aplicar cambios
                    </Button>
                  </div>
                </div>
                <Textarea
                  value={htmlCode}
                  onChange={e => { setHtmlCode(e.target.value); setHtmlDirty(true); }}
                  className="font-mono text-xs border-0 rounded-none focus-visible:ring-0 min-h-[500px] resize-y"
                  spellCheck={false}
                />
                {htmlDirty && (
                  <div className="px-4 py-2 bg-accent/50 border-t text-xs text-muted-foreground">
                    ⚠️ Has editado el HTML. Al aplicar, se reemplazarán todos los bloques con un bloque HTML único.
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right panel - desktop */}
        {!isMobile && (
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
        )}

        {/* Mobile properties drawer */}
        {isMobile && (
          <Sheet open={showProps} onOpenChange={setShowProps}>
            <SheetContent side="right" className="w-[320px] p-4 overflow-y-auto">
              <SheetTitle className="text-sm font-semibold mb-3">Propiedades</SheetTitle>
              <Tabs defaultValue="properties">
                <TabsList className="w-full mb-3">
                  <TabsTrigger value="properties" className="flex-1 text-xs">Propiedades</TabsTrigger>
                  <TabsTrigger value="global" className="flex-1 text-xs"><Settings className="w-3 h-3 mr-1" />Global</TabsTrigger>
                </TabsList>
                <TabsContent value="properties">
                  <PropertiesPanel
                    selectedBlock={selectedBlockData}
                    selectedInnerData={selectedInnerData || null}
                    selectedInner={editor.selectedInner}
                    onUpdateBlock={editor.updateBlock}
                    onUpdateInnerBlock={editor.updateInnerBlock}
                    onChangeColumnLayout={editor.changeColumnLayout}
                  />
                </TabsContent>
                <TabsContent value="global">
                  <GlobalStyles styles={editor.globalStyles} onChange={editor.setGlobalStyles} />
                </TabsContent>
              </Tabs>
            </SheetContent>
          </Sheet>
        )}
      </div>

      <Dialog
        open={sendDialogOpen}
        onOpenChange={(open) => {
          setSendDialogOpen(open);
          if (!open) setSendStep("test");
        }}
      >
        <DialogContent className="sm:max-w-md">
          {sendStep === "test" ? (
            <>
              <DialogHeader>
                <DialogTitle>Paso 1: correo de prueba</DialogTitle>
                <DialogDescription>
                  Envía una prueba real al email indicado con el HTML y asunto actuales. Si llega bien, podrás elegir una agenda.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="send-to">Email de pruebas</Label>
                  <Input
                    id="send-to"
                    type="email"
                    autoComplete="email"
                    placeholder="tu@email.com"
                    value={sendTo}
                    onChange={(e) => setSendTo(e.target.value)}
                    disabled={sendSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="send-subject">Asunto</Label>
                  <Input
                    id="send-subject"
                    type="text"
                    placeholder="Asunto del mensaje"
                    value={sendSubject}
                    onChange={(e) => setSendSubject(e.target.value)}
                    disabled={sendSubmitting}
                  />
                </div>
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={() => setSendDialogOpen(false)} disabled={sendSubmitting}>
                  Cancelar
                </Button>
                <Button type="button" onClick={handleSendTest} disabled={sendSubmitting}>
                  {sendSubmitting ? "Enviando…" : "Enviar prueba"}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Paso 2: agenda de contactos</DialogTitle>
                <DialogDescription>
                  Elige la lista de destinatarios (solo contactos activos). Se usará el mismo asunto y HTML que en la prueba.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="agenda-select">Agenda</Label>
                  <Select value={selectedAgendaId} onValueChange={setSelectedAgendaId} disabled={sendSubmitting}>
                    <SelectTrigger id="agenda-select">
                      <SelectValue placeholder="Selecciona agenda" />
                    </SelectTrigger>
                    <SelectContent>
                      {defaultDirectories.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    {countActiveEmailsForAgenda(selectedAgendaId)} destinatario(s) activo(s)
                  </p>
                </div>
              </div>
              <DialogFooter className="gap-2 sm:gap-0 flex-col sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSendStep("test")}
                  disabled={sendSubmitting}
                  className="w-full sm:w-auto"
                >
                  Atrás
                </Button>
                <div className="flex gap-2 w-full sm:w-auto sm:ml-auto">
                  <Button type="button" variant="outline" onClick={() => setSendDialogOpen(false)} disabled={sendSubmitting}>
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    onClick={handleBulkSend}
                    disabled={sendSubmitting || countActiveEmailsForAgenda(selectedAgendaId) === 0}
                  >
                    {sendSubmitting ? "Enviando…" : "Enviar a la agenda"}
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmailEditor;
