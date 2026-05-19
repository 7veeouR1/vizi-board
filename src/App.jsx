import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Boxes,
  CalendarDays,
  Camera,
  Check,
  ClipboardList,
  Flag,
  MapPin,
  Megaphone,
  Plus,
  RotateCcw,
  Tent,
  Trash2,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const statusOptions = [
  { value: "a-preparer", label: "À préparer", color: "bg-slate-100 text-slate-700 border-slate-200" },
  { value: "charge", label: "Chargé", color: "bg-blue-50 text-blue-700 border-blue-100" },
  { value: "installe", label: "Installé", color: "bg-orange-50 text-orange-700 border-orange-100" },
  { value: "valide", label: "Validé", color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  { value: "recupere", label: "Récupéré", color: "bg-neutral-100 text-neutral-700 border-neutral-200" },
];

const priorityOptions = [
  { value: "haute", label: "Haute" },
  { value: "normale", label: "Normale" },
  { value: "basse", label: "Basse" },
];

const assetTypes = ["Arche", "Bâche", "Oriflamme", "Kakémono", "Photocall", "Panneau", "Stand", "Sticker sol"];
const zones = ["Entrée", "Accueil", "Scène", "Parcours", "Village partenaires", "Zone VIP", "Restauration", "Parking"];

const defaultProject = {
  eventName: "Trail des Bauges",
  brandName: "Montrex Outdoor",
  location: "Aix-les-Bains",
  date: "2026-06-18",
  installDate: "2026-06-17",
  installDeadline: "08:00",
  fieldContact: "Camille Martin — 06 00 00 00 00",
  objective: "Maximiser la visibilité de la marque sur les zones de passage et sécuriser les preuves photo avant ouverture public.",
};

const defaultAssets = [
  {
    id: 1,
    type: "Arche",
    name: "Arche départ / arrivée",
    quantity: 1,
    zone: "Entrée",
    priority: "haute",
    status: "installe",
    note: "Visible depuis l’accès principal. Prévoir 2 personnes pour montage.",
  },
  {
    id: 2,
    type: "Oriflamme",
    name: "Pack oriflammes parcours",
    quantity: 8,
    zone: "Parcours",
    priority: "haute",
    status: "charge",
    note: "À placer aux bifurcations et zones photo.",
  },
  {
    id: 3,
    type: "Photocall",
    name: "Photocall partenaires",
    quantity: 1,
    zone: "Village partenaires",
    priority: "normale",
    status: "a-preparer",
    note: "Vérifier lestage + housse transport.",
  },
  {
    id: 4,
    type: "Bâche",
    name: "Bâche scène podium",
    quantity: 2,
    zone: "Scène",
    priority: "haute",
    status: "valide",
    note: "Photos de preuve à prendre avant 10h.",
  },
  {
    id: 5,
    type: "Panneau",
    name: "Signalétique directionnelle",
    quantity: 12,
    zone: "Parking",
    priority: "normale",
    status: "charge",
    note: "Fléchage parking → accueil → village.",
  },
];

function getStatus(status) {
  return statusOptions.find((option) => option.value === status) || statusOptions[0];
}

function getPriorityLabel(priority) {
  return priorityOptions.find((option) => option.value === priority)?.label || "Normale";
}

function StatCard({ icon: Icon, label, value, helper }) {
  return (
    <Card className="rounded-3xl border-black/10 bg-white shadow-sm shadow-slate-200/60">
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
            <Icon className="h-5 w-5" />
          </div>
          <div className="text-right">
            <div className="text-3xl font-black tracking-[-0.04em] text-slate-950">{value}</div>
            <div className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">{label}</div>
          </div>
        </div>
        <p className="mt-4 text-sm font-medium leading-6 text-slate-500">{helper}</p>
      </CardContent>
    </Card>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-slate-400">{label}</span>
      <Input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-12 rounded-2xl border-black/10 bg-white font-semibold"
      />
    </label>
  );
}

function AssetCard({ asset, mode, onStatusChange, onDelete, onPhotoUpload }) {
  const status = getStatus(asset.status);
  const isCritical = asset.priority === "haute" && asset.status !== "valide" && asset.status !== "recupere";

  return (
    <Card className="rounded-3xl border-black/10 bg-white shadow-sm shadow-slate-200/60">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`rounded-full border px-3 py-1 ${status.color}`}>
                    {status.label}
                  </Badge>

                  {mode === "admin" && (
                    <button
                      type="button"
                      onClick={() => onDelete(asset.id)}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-red-100 bg-red-50 text-red-600 transition hover:bg-red-100"
                      aria-label="Supprimer le support"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              {isCritical && (
                <Badge className="rounded-full bg-orange-100 text-orange-800 hover:bg-orange-100">
                  Critique
                </Badge>
              )}
            </div>
            <h3 className="mt-3 text-xl font-black tracking-[-0.03em] text-slate-950">{asset.name}</h3>
            <div className="mt-2 flex flex-wrap gap-3 text-sm font-semibold text-slate-500">
              <span className="inline-flex items-center gap-1"><Boxes className="h-4 w-4" /> Qté {asset.quantity}</span>
              <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" /> {asset.zone}</span>
              <span>Priorité {getPriorityLabel(asset.priority)}</span>
            </div>
          </div>
          <Badge variant="outline" className={`rounded-full border px-3 py-1 ${status.color}`}>
            {status.label}
          </Badge>
        </div>

        <p className="mt-4 text-sm font-medium leading-6 text-slate-500">{asset.note}</p>

        <div className="mt-4 rounded-3xl border border-black/10 bg-slate-50 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-black text-slate-950">
                Photos de validation
              </div>
              <div className="text-xs font-semibold text-slate-500">
                Ajoutez une preuve photo du montage.
              </div>
            </div>

            <label className="cursor-pointer rounded-full bg-slate-950 px-4 py-2 text-xs font-black text-white transition hover:bg-orange-500">
              Ajouter
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(event) => onPhotoUpload(asset.id, event.target.files?.[0])}
              />
            </label>
          </div>

          {asset.photos?.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {asset.photos.map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt={`Photo de validation ${index + 1}`}
                  className="h-24 w-full rounded-2xl object-cover"
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-sm font-semibold text-slate-400">
              Aucune photo ajoutée.
            </div>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onStatusChange(asset.id, option.value)}
              className={`rounded-2xl border px-3 py-2 text-xs font-black transition ${
                asset.status === option.value
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-black/10 bg-slate-50 text-slate-500 hover:bg-slate-100"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function ViziBoardApp() {
  const [project, setProject] = useState(defaultProject);
  const [assets, setAssets] = useState(defaultAssets);
  const [mode, setMode] = useState("admin");
  const [missionCompleted, setMissionCompleted] = useState(false);
  const [completionError, setCompletionError] = useState(""); 
  const [newAsset, setNewAsset] = useState({
    type: "Oriflamme",
    name: "",
    quantity: "1",
    zone: "Entrée",
    priority: "normale",
    note: "",
  });

  const stats = useMemo(() => {
    const total = assets.length;
    const installed = assets.filter((asset) => ["installe", "valide", "recupere"].includes(asset.status)).length;
    const validated = assets.filter((asset) => asset.status === "valide").length;
    const critical = assets.filter((asset) => asset.priority === "haute" && asset.status !== "valide" && asset.status !== "recupere").length;
    const progress = total ? Math.round(((installed + validated) / (total * 2)) * 100) : 0;

    return { total, installed, validated, critical, progress };
  }, [assets]);

  const groupedByZone = useMemo(() => {
    return zones
      .map((zone) => ({ zone, assets: assets.filter((asset) => asset.zone === zone) }))
      .filter((group) => group.assets.length > 0);
  }, [assets]);

  function addAssetPhoto(assetId, file) {
  if (!file) return;

  const photoUrl = URL.createObjectURL(file);

  setAssets((current) =>
    current.map((asset) =>
      asset.id === assetId
        ? {
            ...asset,
            photos: [...(asset.photos || []), photoUrl],
          }
        : asset
    )
  );
}

  function updateProject(key, value) {
    setProject((current) => ({ ...current, [key]: value }));
  }

  function updateAssetStatus(assetId, status) {
    setAssets((current) => current.map((asset) => (asset.id === assetId ? { ...asset, status } : asset)));
  }

  function deleteAsset(assetId) {
  setAssets((current) => current.filter((asset) => asset.id !== assetId));
}

  function addAsset(event) {
    event.preventDefault();
    if (!newAsset.name.trim()) return;

    setAssets((current) => [
      {
        id: Date.now(),
        type: newAsset.type,
        name: newAsset.name,
        quantity: Number(newAsset.quantity) || 1,
        zone: newAsset.zone,
        priority: newAsset.priority,
        status: "a-preparer",
        note: newAsset.note || "Aucune note terrain.",
      },
      ...current,
    ]);

    setNewAsset({ type: "Oriflamme", name: "", quantity: "1", zone: "Entrée", priority: "normale", note: "" });
  }

  function resetDemo() {
    setProject(defaultProject);
    setAssets(defaultAssets);
  }

  function openMap(location) {
  if (!location) return;

  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

  const fieldBrief = useMemo(() => {
    const criticalAssets = assets.filter((asset) => asset.priority === "haute");
    const todoAssets = assets.filter((asset) => asset.status !== "valide" && asset.status !== "recupere");

    return {
      criticalAssets,
      todoAssets,
      priorities: [
        "Sécuriser les zones à forte visibilité avant ouverture public.",
        "Installer les supports premium avant les supports secondaires.",
        "Prendre les photos de preuve dès qu’une zone est validée.",
      ],
    };
  }, [assets]);

  const totalPhotos = assets.reduce(
  (total, asset) => total + (asset.photos?.length || 0),
  0
  );

  function completeMission() {
  if (totalPhotos === 0) {
    setCompletionError(
      "Ajoutez au moins une photo de validation avant de terminer le montage."
    );
    return;
  }

  setMissionCompleted(true);
  setCompletionError("");
}

  return (
    <main className="min-h-screen bg-[#f5f6f8] text-slate-950">
      <section className="mx-auto max-w-7xl px-4 py-5 md:px-8 md:py-8">
        <header className="flex flex-col gap-4 rounded-[2rem] bg-slate-950 p-5 text-white shadow-2xl shadow-slate-300/70 md:flex-row md:items-center md:justify-between md:p-7">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-white">
                <Flag className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-[-0.07em] md:text-5xl">Vizi Board</h1>
                <p className="mt-1 text-sm font-bold text-white/55">Préparer et suivre la visibilité de marque sur événement.</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="rounded-full bg-white px-4 py-2 text-slate-950 hover:bg-white">
              Démo portfolio
            </Badge>

            <div className="flex rounded-full bg-white/10 p-1">
              <button
                type="button"
                onClick={() => setMode("admin")}
                className={`rounded-full px-4 py-2 text-sm font-black transition ${
                  mode === "admin"
                    ? "bg-white text-slate-950"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Mission
              </button>

              <button
                type="button"
                onClick={() => setMode("terrain")}
                className={`rounded-full px-4 py-2 text-sm font-black transition ${
                  mode === "terrain"
                    ? "bg-orange-500 text-white"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Terrain
              </button>
            </div>

            {mode === "admin" && (
              <Button
                onClick={resetDemo}
                variant="secondary"
                className="rounded-full bg-white/10 text-white hover:bg-white/15"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Réinitialiser
              </Button>
            )}
          </div>
        </header>

        <section
          className={`mt-5 grid gap-5 ${
            mode === "admin" ? "lg:grid-cols-[0.95fr_1.05fr]" : "lg:grid-cols-1"
          }`}
        >
          {mode === "admin" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <Card className="rounded-[2rem] border-black/10 bg-white shadow-sm shadow-slate-200/60">
              <CardContent className="p-5 md:p-6">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-500">Projet</p>
                    <h2 className="mt-1 text-2xl font-black tracking-[-0.04em]">Fiche événement</h2>
                  </div>
                  <Badge variant="outline" className="rounded-full border-black/10 bg-slate-50 text-slate-600">
                    <CalendarDays className="mr-1 h-3 w-3" /> Setup
                  </Badge>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Événement" value={project.eventName} onChange={(value) => updateProject("eventName", value)} />
                  <Field label="Marque" value={project.brandName} onChange={(value) => updateProject("brandName", value)} />
                  <div>
                    <Field label="Lieu" value={project.location} onChange={(value) => updateProject("location", value)} />

                    <button
                      type="button"
                      onClick={() => openMap(project.location)}
                      className="mt-2 inline-flex items-center gap-2 text-sm font-black text-orange-500 transition hover:text-orange-600"
                    >
                      <MapPin className="h-4 w-4" />
                      Ouvrir dans Maps
                    </button>
                  </div>
                  <Field label="Date événement" type="date" value={project.date} onChange={(value) => updateProject("date", value)} />
                  <Field label="Date installation" type="date" value={project.installDate} onChange={(value) => updateProject("installDate", value)} />
                  <Field label="Heure limite installation" type="time" value={project.installDeadline} onChange={(value) => updateProject("installDeadline", value)} />
                  <Field label="Contact terrain" value={project.fieldContact} onChange={(value) => updateProject("fieldContact", value)} />
                </div>

                <label className="mt-4 block">
                  <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-slate-400">Objectif visibilité</span>
                  <Textarea
                    value={project.objective}
                    onChange={(event) => updateProject("objective", event.target.value)}
                    className="min-h-[110px] rounded-2xl border-black/10 bg-white font-medium leading-6"
                  />
                </label>
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] border-black/10 bg-white shadow-sm shadow-slate-200/60">
              <CardContent className="p-5 md:p-6">
                <div className="mb-5">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-500">Ajouter</p>
                  <h2 className="mt-1 text-2xl font-black tracking-[-0.04em]">Nouveau support</h2>
                </div>

                <form onSubmit={addAsset} className="grid gap-4">
                  <Input
                    value={newAsset.name}
                    onChange={(event) => setNewAsset((current) => ({ ...current, name: event.target.value }))}
                    placeholder="Nom du support — ex : Kakémono accueil"
                    className="h-12 rounded-2xl border-black/10 bg-white font-semibold"
                  />

                  <div className="grid gap-3 md:grid-cols-3">
                    <Select value={newAsset.type} onValueChange={(value) => setNewAsset((current) => ({ ...current, type: value }))}>
                      <SelectTrigger className="h-12 rounded-2xl border-black/10 bg-white font-semibold">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {assetTypes.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                      </SelectContent>
                    </Select>

                    <Select value={newAsset.zone} onValueChange={(value) => setNewAsset((current) => ({ ...current, zone: value }))}>
                      <SelectTrigger className="h-12 rounded-2xl border-black/10 bg-white font-semibold">
                        <SelectValue placeholder="Zone" />
                      </SelectTrigger>
                      <SelectContent>
                        {zones.map((zone) => <SelectItem key={zone} value={zone}>{zone}</SelectItem>)}
                      </SelectContent>
                    </Select>

                    <Select value={newAsset.priority} onValueChange={(value) => setNewAsset((current) => ({ ...current, priority: value }))}>
                      <SelectTrigger className="h-12 rounded-2xl border-black/10 bg-white font-semibold">
                        <SelectValue placeholder="Priorité" />
                      </SelectTrigger>
                      <SelectContent>
                        {priorityOptions.map((priority) => <SelectItem key={priority.value} value={priority.value}>{priority.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-3 md:grid-cols-[120px_1fr]">
                    <Input
                      value={newAsset.quantity}
                      onChange={(event) => setNewAsset((current) => ({ ...current, quantity: event.target.value }))}
                      placeholder="Qté"
                      type="number"
                      min="1"
                      className="h-12 rounded-2xl border-black/10 bg-white font-semibold"
                    />
                    <Input
                      value={newAsset.note}
                      onChange={(event) => setNewAsset((current) => ({ ...current, note: event.target.value }))}
                      placeholder="Note terrain — emplacement, contrainte, photo à prévoir..."
                      className="h-12 rounded-2xl border-black/10 bg-white font-semibold"
                    />
                  </div>

                  <Button type="submit" className="h-13 rounded-full bg-orange-500 font-black text-white hover:bg-orange-600">
                    <Plus className="mr-2 h-4 w-4" /> Ajouter au board
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
    )}



          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="space-y-5">
            {mode === "terrain" && (
              <Card className="rounded-[2rem] border-orange-100 bg-orange-50 shadow-none">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <Truck className="mt-1 h-5 w-5 text-orange-600" />
                    <div>
                      <h2 className="text-xl font-black tracking-[-0.03em] text-slate-950">
                        Vue terrain
                      </h2>
                      <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                        Cette vue est pensée pour les monteurs : changement de statut, lecture des consignes et ajout de photos.
                        Les supports ne peuvent pas être supprimés ici.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard icon={Boxes} label="Supports" value={stats.total} helper="éléments à suivre" />
              <StatCard icon={Truck} label="Installés" value={stats.installed} helper="posés ou validés" />
              <StatCard icon={Camera} label="Validés" value={stats.validated} helper="preuves à jour" />
              <StatCard icon={AlertTriangle} label="Critiques" value={stats.critical} helper="priorité haute" />
            </div>

            <Card className="rounded-[2rem] border-black/10 bg-white shadow-sm shadow-slate-200/60">
              <CardContent className="p-5 md:p-6">
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-500">Déploiement</p>
                    <h2 className="mt-1 text-2xl font-black tracking-[-0.04em]">Avancement terrain</h2>
                  </div>
                  <div className="text-right text-4xl font-black tracking-[-0.06em]">{stats.progress}%</div>
                </div>
                <Progress value={stats.progress} className="mt-5 h-3" />
                <p className="mt-4 text-sm font-medium leading-6 text-slate-500">
                  Score basé sur les supports installés et validés. L’objectif : savoir en un coup d’œil si la marque est visible avant l’ouverture public.
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] border-black/10 bg-slate-950 text-white shadow-xl shadow-slate-300/50">
              <CardContent className="p-5 md:p-6">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-400">Field brief</p>
                    <h2 className="mt-1 text-2xl font-black tracking-[-0.04em]">Brief terrain généré</h2>
                  </div>
                  <ClipboardList className="h-6 w-6 text-white/45" />
                </div>

                <div className="grid gap-4">
                  <div className="rounded-3xl bg-white/7 p-4">
                    <div className="text-sm font-black text-white/45">Événement</div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 font-semibold leading-7">
                      <span>{project.eventName} — {project.brandName},</span>

                      <button
                        type="button"
                        onClick={() => openMap(project.location)}
                        className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-sm font-black text-white transition hover:bg-orange-500"
                      >
                        <MapPin className="h-4 w-4" />
                        {project.location}
                      </button>
                    </div>
                    <p className="text-sm font-medium text-white/55">
                      Installation le {project.installDate} avant {project.installDeadline} · Contact : {project.fieldContact}
                    </p>
                  </div>

                  <div className="rounded-3xl bg-white/7 p-4">
                    <div className="text-sm font-black text-white/45">Priorités terrain</div>
                    <ul className="mt-2 space-y-2 text-sm font-medium leading-6 text-white/75">
                      {fieldBrief.priorities.map((priority) => <li key={priority}>• {priority}</li>)}
                    </ul>
                  </div>

                  <div className="rounded-3xl bg-white/7 p-4">
                    <div className="text-sm font-black text-white/45">Supports prioritaires</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {fieldBrief.criticalAssets.map((asset) => (
                        <Badge key={asset.id} className="rounded-full bg-orange-500 text-white hover:bg-orange-500">
                          {asset.quantity}× {asset.type} · {asset.zone}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

              {mode === "terrain" && (
                <Card className="rounded-[2rem] border-black/10 bg-white shadow-sm shadow-slate-200/60">
                  <CardContent className="p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-500">
                          Validation terrain
                        </p>
                        <h2 className="mt-1 text-2xl font-black tracking-[-0.04em] text-slate-950">
                          Finaliser le montage
                        </h2>
                        <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
                          {totalPhotos} photo{totalPhotos > 1 ? "s" : ""} ajoutée
                          {totalPhotos > 1 ? "s" : ""} sur cette mission.
                        </p>
                      </div>

                      <Button
                        onClick={completeMission}
                        className={`h-13 rounded-full px-6 font-black ${
                          missionCompleted
                            ? "bg-emerald-600 text-white hover:bg-emerald-600"
                            : "bg-orange-500 text-white hover:bg-orange-600"
                        }`}
                      >
                        {missionCompleted ? "Montage terminé ✓" : "Montage terminé"}
                      </Button>
                    </div>

                    {completionError && (
                      <div className="mt-4 rounded-2xl bg-red-50 p-4 text-sm font-black text-red-600">
                        {completionError}
                      </div>
                    )}

                    {missionCompleted && (
                      <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm font-black text-emerald-700">
                        Mission validée avec preuve photo. Le montage peut être considéré comme terminé.
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

          </motion.div>
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-500">Board</p>
                <h2 className="text-3xl font-black tracking-[-0.05em]">Supports de visibilité</h2>
              </div>
              <Badge variant="outline" className="rounded-full border-black/10 bg-white text-slate-600">
                {assets.length} éléments
              </Badge>
            </div>

            {assets.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                mode={mode}
                onStatusChange={updateAssetStatus}
                onDelete={deleteAsset}
                onPhotoUpload={addAssetPhoto}
              />
            ))}
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-500">Zones</p>
              <h2 className="text-3xl font-black tracking-[-0.05em]">Vue par emplacement</h2>
            </div>

            {groupedByZone.map((group) => {
              const zoneDone = group.assets.filter((asset) => ["installe", "valide", "recupere"].includes(asset.status)).length;
              const zoneProgress = Math.round((zoneDone / group.assets.length) * 100);
              return (
                <Card key={group.zone} className="rounded-3xl border-black/10 bg-white shadow-sm shadow-slate-200/60">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 text-lg font-black text-slate-950">
                          <MapPin className="h-5 w-5 text-orange-500" /> {group.zone}
                        </div>
                        <p className="mt-1 text-sm font-semibold text-slate-500">{group.assets.length} support(s)</p>
                      </div>
                      <div className="text-2xl font-black tracking-[-0.04em]">{zoneProgress}%</div>
                    </div>
                    <Progress value={zoneProgress} className="mt-4 h-2" />
                    <div className="mt-4 space-y-2">
                      {group.assets.map((asset) => (
                        <div key={asset.id} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-2">
                          <div className="text-sm font-bold text-slate-700">{asset.name}</div>
                          <Badge variant="outline" className={`rounded-full border text-xs ${getStatus(asset.status).color}`}>
                            {getStatus(asset.status).label}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      </section>
    </main>
  );
}
