import { Link } from "react-router-dom";
import { Plus, Search, Filter, MoreHorizontal } from "lucide-react";
import { campaigns } from "@/data/mockData";
import CampaignStatusBadge from "@/components/CampaignStatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Campaigns = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Campañas</h1>
          <p className="text-muted-foreground mt-1">Gestiona y monitorea tus campañas de email</p>
        </div>
        <Link to="/campaigns/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" /> Nueva Campaña
          </Button>
        </Link>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar campañas..." className="pl-9" />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Destinatarios</TableHead>
              <TableHead className="text-right">Entregados</TableHead>
              <TableHead className="text-right">Abiertos</TableHead>
              <TableHead className="text-right">Clicks</TableHead>
              <TableHead className="text-right">Rebotados</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.map((c) => (
              <TableRow key={c.id} className="cursor-pointer hover:bg-muted/50">
                <TableCell>
                  <Link to={`/reports/${c.id}`} className="hover:underline">
                    <p className="font-medium text-sm">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.subject}</p>
                  </Link>
                </TableCell>
                <TableCell><CampaignStatusBadge status={c.status} /></TableCell>
                <TableCell className="text-right text-sm">{c.recipients.toLocaleString()}</TableCell>
                <TableCell className="text-right text-sm">{c.delivered.toLocaleString()}</TableCell>
                <TableCell className="text-right text-sm">{c.opened.toLocaleString()}</TableCell>
                <TableCell className="text-right text-sm">{c.clicked.toLocaleString()}</TableCell>
                <TableCell className="text-right text-sm">{c.bounced.toLocaleString()}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {c.sentAt || c.scheduledAt || c.createdAt}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Ver reporte</DropdownMenuItem>
                      <DropdownMenuItem>Duplicar</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Eliminar</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Campaigns;
