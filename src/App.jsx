import React, { useMemo, useEffect, useState } from "react";
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
  Phone,
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
  { value: "charge", label: "Chargé", color: "bg-blue-50 text-blue-700 border-blue-100" },
  { value: "valide", label: "Installé", color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  { value: "recupere", label: "Récupéré", color: "bg-neutral-100 text-neutral-700 border-neutral-200" },
];

const priorityOptions = [
  { value: "haute", label: "Haute" },
  { value: "normale", label: "Normale" },
  { value: "basse", label: "Basse" },
];

const assetTypes = ["Arche", "Bâche", "Oriflamme", "Kakémono", "Photocall", "Panneau", "Stand", "Sticker sol"];
const zones = ["Entrée", "Accueil", "Scène", "Parcours", "Village partenaires", "Zone VIP", "Restauration", "Parking"];

const defaultBrands = [
  {
    id: "explore-savoie",
    name: "Explore Savoie",
    contactName: "Équipe Explore Savoie",
    contactEmail: "contact@explore-savoie.fr",
    logo: "/brands/explore-savoie-logo.png",
    notes:
      "Marque test pour la saison. Objectif : suivre les déploiements terrain et produire des preuves propres après installation.",
  },
];

const defaultInventory = [
  {
    id: "explore-arche-01",
    brandId: "explore-savoie",
    type: "Arche",
    name: "Arche Explore Savoie",
    quantityAvailable: 2,
    condition: "Bon état",
    referencePhoto: "/inventory/explore-savoie/arche.jpg",
    note: "Prévoir lestage complet et vérification soufflerie avant départ.",
  },
  {
    id: "explore-oriflamme-01",
    brandId: "explore-savoie",
    type: "Oriflamme",
    name: "Oriflammes Explore Savoie",
    quantityAvailable: 8,
    condition: "Bon état",
    referencePhoto: "/inventory/explore-savoie/oriflamme.jpg",
    note: "À placer sur les zones de passage, entrées et points photo.",
  },
  {
    id: "explore-kakemono-01",
    brandId: "explore-savoie",
    type: "Kakémono",
    name: "Kakémono accueil Explore Savoie",
    quantityAvailable: 2,
    condition: "Bon état",
    referencePhoto: "/inventory/explore-savoie/kakemono.jpg",
    note: "Support indoor ou zone abritée uniquement.",
  },
  {
    id: "explore-photocall-01",
    brandId: "explore-savoie",
    type: "Photocall",
    name: "Photocall Explore Savoie",
    quantityAvailable: 1,
    condition: "À contrôler",
    referencePhoto: "/inventory/explore-savoie/photocall.jpg",
    note: "Vérifier structure, housse et système de fixation.",
  },
];

const defaultInstallers = [
  {
    id: "kilian-combey",
    name: "Kilian Combey",
    phone: "06 00 00 00 00",
  },
  {
    id: "kevin-lefant",
    name: "Kevin Lefant",
    phone: "07 63 50 48 22",
  },
];

const defaultProject = {
  id: "mission-demo-001",
  eventName: "",
  brandId: "",
  location: "",
  date: "",
  installDate: "",
  installDeadline: "",
  fieldContact: "",
  objective:
    "Déployer la visibilité Explore Savoie sur les zones de passage, sécuriser les supports installés et produire des preuves photo exploitables pour le récap marque.",
  installerId: "",
};

const defaultAssets = [];

const DEMO_TERRAIN_TOKEN = "vizi-demo-token";

const DEMO_PROVIDERS = [
  {
    id: "kevin-lefant",
    email: "contact@kevinlefant.com",
    password: "K7v!zB92xL",
    name: "Kevin",
  },

{
  email: "demo@viziboard.fr",
  password: "demo123",
  name: "Prestataire Vizi Board",
},
];

const defaultMissions = [
  {
    id: "mission-demo-001",
    eventName: "Activation été — Lac du Bourget",
    brandName: "Explore Savoie",
    location: "Aix-les-Bains",
    installDate: "2026-06-17",
    status: "draft",
    statusLabel: "Brouillon",
  },
  {
    id: "mission-demo-002",
    eventName: "Trail des Bauges",
    brandName: "Explore Savoie",
    location: "Le Châtelard",
    installDate: "2026-06-04",
    status: "submitted_by_installer",
    statusLabel: "À valider",
  },
  {
    id: "mission-demo-003",
    eventName: "Salon outdoor Savoie",
    brandName: "Explore Savoie",
    location: "Chambéry",
    installDate: "2026-07-12",
    status: "assigned",
    statusLabel: "Assignée",
  },
  {
    id: "mission-demo-004",
    eventName: "Test PLV printemps",
    brandName: "Explore Savoie",
    location: "Annecy",
    installDate: "2026-05-12",
    status: "validated_by_provider",
    statusLabel: "Validée",
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
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-white/40">
        {label}
      </span>

      <Input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-12 rounded-2xl border-white/10 bg-white/[0.08] font-semibold text-white placeholder:text-white/35 [color-scheme:dark]"
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

        {asset.referencePhoto && (
          <div className="mt-4 overflow-hidden rounded-3xl border border-black/10 bg-slate-50">
            <div className="grid gap-4 p-4 md:grid-cols-[140px_1fr]">
              <img
                src={asset.referencePhoto}
                alt={asset.name}
                className="h-32 w-full rounded-2xl object-cover md:w-36"
              />

              <div className="flex flex-col justify-center">
                <div className="text-sm font-black text-slate-950">
                  Photo de référence
                </div>
                <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
                  Cette image sert de repère au monteur pour identifier le bon support avant installation.
                </p>
              </div>
            </div>
          </div>
        )}

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

function MissionSection({ title, helper, missions, onOpenMission }) {
  return (
    <section className="grid gap-3">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-[-0.04em] text-white">
            {title}
          </h2>
          <p className="mt-1 text-sm font-semibold text-white/45">
            {helper}
          </p>
        </div>

        <Badge
          variant="outline"
          className="rounded-full border-white/10 bg-white/[0.06] text-white/60"
        >
          {missions.length}
        </Badge>
      </div>

      {missions.length === 0 ? (
        <Card className="rounded-3xl border border-dashed border-white/10 bg-white/[0.035] text-white backdrop-blur-xl">
          <CardContent className="p-5">
            <p className="text-sm font-semibold text-white/40">
              Aucune mission dans cette catégorie.
            </p>
          </CardContent>
        </Card>
      ) : (
        missions.map((mission) => (
          <Card
            key={mission.id}
            className="rounded-3xl border border-white/10 bg-white/[0.055] text-white backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.075]"
          >
            <CardContent className="p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className="rounded-full border-white/10 bg-white/[0.06] text-white/60"
                    >
                      {mission.statusLabel}
                    </Badge>

                    <Badge className="rounded-full bg-orange-500/15 text-orange-300 hover:bg-orange-500/15">
                      {mission.brandName}
                    </Badge>
                  </div>

                  <h3 className="text-2xl font-black tracking-[-0.04em] text-white">
                    {mission.eventName}
                  </h3>

                  <p className="mt-2 text-sm font-semibold leading-6 text-white/50">
                    {mission.location} · Installation :{" "}
                    {mission.installDate || "date à définir"}
                  </p>
                </div>

                <Button
                  type="button"
                  onClick={() => onOpenMission(mission.id)}
                  className="rounded-full bg-white text-slate-950 font-black hover:bg-orange-500 hover:text-white"
                >
                  Ouvrir
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </section>
  );
}

export default function ViziBoardApp() {

  const [currentScreen, setCurrentScreen] = useState("login");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });
  const [loginError, setLoginError] = useState("");
  const [missions, setMissions] = useState(defaultMissions);
  const [activeMissionId, setActiveMissionId] = useState(null);

  const [project, setProject] = useState(defaultProject);
  const [assets, setAssets] = useState(defaultAssets);
  const [brands] = useState(defaultBrands);
  const [inventory] = useState(defaultInventory);
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
  const [inventorySelection, setInventorySelection] = useState({
  search: "",
  itemId: "",
  quantity: "1",
  zone: "Entrée",
  priority: "normale",
});
const [missionComment, setMissionComment] = useState("");

const [missionComments, setMissionComments] = useState([]);

const [installers] = useState(defaultInstallers);

const [currentUser, setCurrentUser] = useState(null);

const selectedInstaller = useMemo(() => {
  return installers.find((installer) => installer.id === project.installerId) || null;
}, [installers, project.installerId]);

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

  const selectedBrand = useMemo(() => {
  return brands.find((brand) => brand.id === project.brandId) || null;
}, [brands, project.brandId]);

  const brandInventory = useMemo(() => {
  if (!project.brandId) return [];

  return inventory.filter((item) => item.brandId === project.brandId);
}, [inventory, project.brandId]);

  const filteredBrandInventory = useMemo(() => {
  const search = inventorySelection.search.trim().toLowerCase();

  if (!search) return brandInventory;

  return brandInventory.filter((item) => {
    return (
      item.name.toLowerCase().includes(search) ||
      item.type.toLowerCase().includes(search) ||
      item.condition.toLowerCase().includes(search) ||
      item.note.toLowerCase().includes(search)
    );
  });
}, [brandInventory, inventorySelection.search]);

const selectedInventoryItem = useMemo(() => {
  return brandInventory.find((item) => item.id === inventorySelection.itemId);
}, [brandInventory, inventorySelection.itemId]);

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

const urlParams = useMemo(() => {
  if (typeof window === "undefined") {
    return {
      missionId: "",
      installerId: "",
      token: "",
    };
  }

const params = new URLSearchParams(window.location.search);

  return {
    missionId: params.get("missionId") || "",
    installerId: params.get("installerId") || "",
    token: params.get("token") || "",
  };
}, []);

const hasTerrainParams =
  !!urlParams.missionId && !!urlParams.installerId && !!urlParams.token;

const isTerrainLink =
  urlParams.missionId === project.id &&
  urlParams.installerId === project.installerId &&
  urlParams.token === DEMO_TERRAIN_TOKEN;

const terrainLink = useMemo(() => {
  if (!selectedInstaller) return "";

  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin + window.location.pathname
      : "";

  const params = new URLSearchParams({
    missionId: project.id,
    installerId: selectedInstaller.id,
    token: DEMO_TERRAIN_TOKEN,
  });

  return `${baseUrl}?${params.toString()}`;
}, [project.id, selectedInstaller]);

const groupedMissions = useMemo(() => {
  return {
    current: missions.filter((mission) => getMissionCategory(mission) === "current"),
    upcoming: missions.filter((mission) => getMissionCategory(mission) === "upcoming"),
    past: missions.filter((mission) => getMissionCategory(mission) === "past"),
  };
}, [missions]);

const isTerrainAccessGranted = mode === "terrain" && isTerrainLink;

useEffect(() => {
  if (hasTerrainParams) {
    setCurrentScreen("terrain");
  }
}, [hasTerrainParams]);

const totalPhotos = assets.reduce(
  (total, asset) => total + (asset.photos?.length || 0),
  0
  );

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

  function addInventoryItemToMission(event) {
  event.preventDefault();

  if (!selectedInventoryItem) return;

  const requestedQuantity = Number(inventorySelection.quantity) || 1;
  const safeQuantity = Math.min(
    Math.max(requestedQuantity, 1),
    selectedInventoryItem.quantityAvailable
  );

  setAssets((current) => [
    {
      id: Date.now(),
      inventoryItemId: selectedInventoryItem.id,
      type: selectedInventoryItem.type,
      name: selectedInventoryItem.name,
      quantity: safeQuantity,
      zone: inventorySelection.zone,
      priority: inventorySelection.priority,
      status: "a-preparer",
      note: selectedInventoryItem.note || "Aucune note terrain.",
      referencePhoto: selectedInventoryItem.referencePhoto,
      photos: [],
    },
    ...current,
  ]);

  setInventorySelection({
    search: "",
    itemId: "",
    quantity: "1",
    zone: "Entrée",
    priority: "normale",
  });
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

  function addMissionComment(event) {
  event.preventDefault();

  if (!missionComment.trim()) return;

  const now = new Date();

  const formattedDate = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(now);

  setMissionComments((current) => [
    {
      id: Date.now(),
      authorRole: mode === "terrain" ? "monteur" : "donneur",
      authorName: mode === "terrain" ? "Monteur terrain" : "Kevin L",
      message: missionComment.trim(),
      createdAt: formattedDate,
    },
    ...current,
  ]);

  setMissionComment("");
}

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

  function assignInstaller(installerId) {
  setProject((current) => ({
    ...current,
    installerId,
  }));
}

function handleLogin(event) {
  event.preventDefault();

  const user = DEMO_PROVIDERS.find(
    (provider) =>
      provider.email === loginForm.email.trim() &&
      provider.password === loginForm.password
  );

  if (!user) {
    setLoginError("Identifiants incorrects.");
    return;
  }

  setCurrentUser(user);
  setIsAuthenticated(true);
  setLoginError("");
  setCurrentScreen("dashboard");
}

function logout() {
  setCurrentUser(null);
  setIsAuthenticated(false);
  setCurrentScreen("login");
  setLoginForm({ email: "", password: "" });
}

function openMission(missionId) {
  setActiveMissionId(missionId);
  setCurrentScreen("mission");
}

function createNewMission() {
  const missionId = `mission-${Date.now()}`;

  const newMission = {
    id: missionId,
    eventName: "Nouvelle mission",
    brandName: "Non définie",
    location: "Lieu à définir",
    installDate: "",
    status: "draft",
    statusLabel: "Brouillon",
  };

  setMissions((current) => [newMission, ...current]);

  setProject({
    ...defaultProject,
    id: missionId,
    eventName: "Nouvelle mission",
    brandId: "",
    installerId: "",
    location: "",
    fieldContact: "",
    objective: "",
  });

  setAssets([]);
  setActiveMissionId(missionId);
  setCurrentScreen("mission");
}

function getMissionCategory(mission) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!mission.installDate) return "upcoming";

  const installDate = new Date(mission.installDate);
  installDate.setHours(0, 0, 0, 0);

  const activeStatuses = ["assigned", "in_progress", "submitted_by_installer"];

  if (activeStatuses.includes(mission.status)) {
    return "current";
  }

  if (installDate >= today) {
    return "upcoming";
  }

  return "past";
}

if (currentScreen === "terrain") {
  if (!isTerrainLink) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#050B14] text-white">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(rgba(255,255,255,0.16)_1px,transparent_1px)] bg-[size:22px_22px] opacity-35" />

        <section className="relative z-10 mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4 py-10">
          <Card className="w-full rounded-[2rem] border border-red-400/20 bg-red-500/10 text-white backdrop-blur-xl">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-500/15 text-red-300">
                  <AlertTriangle className="h-6 w-6" />
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-red-300">
                    Accès refusé
                  </p>

                  <h1 className="mt-2 text-3xl font-black tracking-[-0.05em] text-white">
                    Lien terrain invalide
                  </h1>

                  <p className="mt-3 text-sm font-semibold leading-6 text-white/60">
                    Cette mission est accessible uniquement via le lien envoyé par le donneur de mission.
                  </p>

                  <p className="mt-4 text-sm font-medium leading-6 text-white/45">
                    Demande au donneur de mission de te renvoyer le bon lien.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050B14] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(rgba(255,255,255,0.16)_1px,transparent_1px)] bg-[size:22px_22px] opacity-35" />

      <section className="relative z-10 mx-auto max-w-5xl px-4 py-5 md:px-8 md:py-8">
        <header className="rounded-[2rem] border border-white/10 bg-[#0B1624]/85 p-5 text-white backdrop-blur-xl md:p-7">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-white">
              <Truck className="h-6 w-6" />
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-400">
                Vue terrain
              </p>

              <h1 className="mt-1 text-3xl font-black tracking-[-0.05em] md:text-4xl">
                {project.eventName}
              </h1>

              <p className="mt-2 text-sm font-semibold leading-6 text-white/55">
                Mission assignée à {selectedInstaller?.name}
              </p>
            </div>
          </div>
        </header>

        <section className="mt-5 grid gap-5">
          <Card className="rounded-[2rem] border border-white/10 bg-[#0B1624]/85 text-white backdrop-blur-xl">
            <CardContent className="p-5 md:p-6">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-400">
                Brief terrain
              </p>

              <h2 className="mt-1 text-2xl font-black tracking-[-0.04em]">
                Informations mission
              </h2>

              <div className="mt-4 grid gap-3 text-sm font-semibold leading-6 text-white/60">
                <p>Lieu : {project.location || "Non renseigné"}</p>
                <p>
                  Installation : {project.installDate || "Date non renseignée"} avant{" "}
                  {project.installDeadline || "heure non renseignée"}
                </p>
                <p>
                  Contact organisateur : {project.fieldContact || "Non renseigné"}
                </p>
              </div>

              {project.objective && (
                <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                  <div className="text-sm font-black text-white">
                    Objectif visibilité
                  </div>
                  <p className="mt-2 text-sm font-medium leading-6 text-white/60">
                    {project.objective}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-400">
                Supports à installer
              </p>
              <h2 className="mt-1 text-3xl font-black tracking-[-0.05em]">
                Mission terrain
              </h2>
            </div>

            {assets.length === 0 ? (
              <Card className="rounded-3xl border border-dashed border-white/10 bg-white/[0.04] text-white backdrop-blur-xl">
                <CardContent className="p-6">
                  <p className="text-sm font-semibold text-white/45">
                    Aucun support ajouté à cette mission.
                  </p>
                </CardContent>
              </Card>
            ) : (
              assets.map((asset) => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  mode="terrain"
                  onStatusChange={updateAssetStatus}
                  onDelete={deleteAsset}
                  onPhotoUpload={addAssetPhoto}
                />
              ))
            )}
          </div>

          <Card className="rounded-[2rem] border border-white/10 bg-[#0B1624]/85 text-white backdrop-blur-xl">
            <CardContent className="p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-400">
                    Validation terrain
                  </p>

                  <h2 className="mt-1 text-2xl font-black tracking-[-0.04em]">
                    Finaliser le montage
                  </h2>

                  <p className="mt-1 text-sm font-semibold leading-6 text-white/50">
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
                <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm font-black text-red-200">
                  {completionError}
                </div>
              )}

              {missionCompleted && (
                <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm font-black text-emerald-200">
                  Mission validée avec preuve photo. Le montage peut être considéré comme terminé.
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </section>
    </main>
  );
}

if (currentScreen === "login") {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[url('/login-bg.jpg')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-slate-950/35" />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/40 via-slate-950/15 to-orange-950/20" />

      <section className="relative z-10 mx-auto flex min-h-screen max-w-md items-center justify-center px-4 py-10">
        <Card className="w-full rounded-[2rem] border border-white/15 bg-white/10 text-white shadow-2xl shadow-black/40 backdrop-blur-2xl">
          <CardContent className="p-6 md:p-8">
            <div className="mb-8 flex flex-col items-center text-center">
  
              <h1 className="mt-5 text-4xl font-black tracking-[-0.07em]">
                Vizi Board
              </h1>

              <p className="mt-2 text-sm font-semibold leading-6 text-white/60">
                Connexion prestataire. Crée, assigne et valide tes missions de visibilité terrain.
              </p>
            </div>

            <form onSubmit={handleLogin} className="grid gap-4">
              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-white/45">
                  Email
                </span>
                <Input
                  type="email"
                  value={loginForm.email}
                  onChange={(event) =>
                    setLoginForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  placeholder=" votre addresse email"
                  className="h-12 rounded-2xl border-white/10 bg-white/10 font-semibold text-white placeholder:text-white/35"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-white/45">
                  Mot de passe
                </span>
                <Input
                  type="password"
                  value={loginForm.password}
                  onChange={(event) =>
                    setLoginForm((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                  placeholder="mot de passe"
                  className="h-12 rounded-2xl border-white/10 bg-white/10 font-semibold text-white placeholder:text-white/35"
                />
              </label>

              {loginError && (
                <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-3 text-sm font-black text-red-200">
                  {loginError}
                </div>
              )}

              <Button
                type="submit"
                className="h-13 rounded-full bg-neutral-950 font-black text-white hover:bg-orange-600"
              >
                Se connecter
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>

            <div className="mt-5 rounded-2xl border border-white/10 bg-white/10 p-4 text-xs font-semibold leading-6 text-white/50">
              Accès Kevin : contact@kevinlefant.com / K7v!zB92xL
              <br />
              Accès démo : demo@viziboard.fr / demo123
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

if (currentScreen === "dashboard" && isAuthenticated) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050506] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(rgba(255,255,255,0.14)_1px,transparent_1px)] bg-[size:22px_22px] opacity-35" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.05),transparent_34%)]" />
      <section className="relative z-10 mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-10">
        <header className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-slate/[0.055] p-5 text-white backdrop-blur-xl md:flex-row md:items-center md:justify-between md:p-7">
          <div>
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-4xl font-black tracking-[-0.07em] md:text-5xl">
                  Bonjour {currentUser?.name || "utilisateur"}
                </h1>

                <p className="mt-1 text-sm font-semibold text-white/40">
                  Historique et création des missions terrain.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              onClick={createNewMission}
              className="rounded-full bg-orange-500 font-black text-white hover:bg-orange-600"
            >
              <Plus className="mr-2 h-4 w-4" />
              Créer une mission
            </Button>

            <Button
              type="button"
              onClick={logout}
              variant="secondary"
              className="rounded-full bg-white/10 text-white hover:bg-white/15"
            >
              Déconnexion
            </Button>
          </div>
        </header>

        <Card className="mt-6 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.055] text-white backdrop-blur-xl">
          <CardContent className="p-0">
            <div className="relative h-56 overflow-hidden md:h-72">
              <img
                src="/dashboard-hero.jpg"
                alt="Préparation terrain événementielle"
                className="h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-black/35" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/25 to-transparent" />

              <div className="absolute bottom-0 left-0 max-w-2xl p-5 md:p-7">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-400">
                  Terrain operations
                </p>

                <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] text-white md:text-4xl">
                  Pilote tes missions de visibilité sans perdre le terrain de vue.
                </h2>

                <p className="mt-3 text-sm font-semibold leading-6 text-white/65">
                  Crée, assigne, suis et valide tes déploiements PLV depuis un seul espace.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <section className="mt-6 grid gap-8">
          <MissionSection
            title="En cours"
            helper="Missions assignées, en exécution ou en attente de validation."
            missions={groupedMissions.current}
            onOpenMission={openMission}
          />

          <MissionSection
            title="À venir"
            helper="Missions planifiées ou encore en préparation."
            missions={groupedMissions.upcoming}
            onOpenMission={openMission}
          />

          <MissionSection
            title="Passées"
            helper="Missions terminées ou dont la date d’installation est passée."
            missions={groupedMissions.past}
            onOpenMission={openMission}
          />
        </section>
      </section>
    </main>
  );
}

if (mode === "terrain" && !isTerrainAccessGranted) {
  return (
    <main className="min-h-screen bg-[#f5f6f8] text-slate-950">
      <section className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4 py-10">
        <Card className="w-full rounded-[2rem] border-red-100 bg-red-50 shadow-sm">
          <CardContent className="p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                <AlertTriangle className="h-6 w-6" />
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-red-500">
                  Accès refusé
                </p>

                <h1 className="mt-2 text-3xl font-black tracking-[-0.05em] text-red-700">
                  Mission terrain non accessible
                </h1>

                <p className="mt-3 text-sm font-semibold leading-6 text-red-600">
                  Cette mission est accessible uniquement via le lien terrain généré pour le monteur assigné.
                </p>

                <p className="mt-4 text-sm font-medium leading-6 text-red-500">
                  Demande au donneur de mission de te renvoyer le bon lien.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
if (currentScreen === "mission" && isAuthenticated) {
  return (
   <main className="relative min-h-screen overflow-hidden bg-[#050B14] text-white">
  <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(rgba(255,255,255,0.18)_1px,transparent_1px)] bg-[size:22px_22px] opacity-45" />
  <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.07),transparent_36%)]" />

  <section className="relative z-10 mx-auto max-w-7xl px-4 py-5 md:px-8 md:py-8">
        <header className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 text-white backdrop-blur-xl md:flex-row md:items-center md:justify-between md:p-7">
          <div>
            <div className="flex items-center gap-3">
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

            {/* <div className="flex rounded-full bg-white/10 p-1">
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
            </div> */}

            <Button
              type="button"
              onClick={() => setCurrentScreen("dashboard")}
              variant="secondary"
              className="rounded-full bg-white/10 text-white hover:bg-white/15"
            >
              Retour missions
            </Button>

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
            <Card className="rounded-[2rem] border border-white/10 bg-white/[0.06] text-white shadow-2xl shadow-black/20 backdrop-blur-xl">
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
                    <Field label="Événement" value={project.eventName} onChange={(value) => updateProject("eventName", value)} placeholder="Nom de l'événement" />
                      <label className="block">
                        <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                          Marque
                        </span>

                        <Select
                          value={project.brandId}
                          onValueChange={(value) => updateProject("brandId", value)}
                        >
                          <SelectTrigger className="h-12 rounded-2xl border-white/10 bg-black/100 text-white font-semibold backdrop-blur-xl">
                            <SelectValue placeholder="Sélectionner une marque" />
                          </SelectTrigger>
                          <SelectContent>
                            {brands.map((brand) => (
                              <SelectItem key={brand.id} value={brand.id}>
                                {brand.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </label>
                  <div>
                    <Field label="Lieu" value={project.location} onChange={(value) => updateProject("location", value)} placeholder="Ajouter un lieu" />

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
                  <Field label="Contact terrain" value={project.fieldContact} onChange={(value) => updateProject("fieldContact", value)} placeholder="Renseigner contact" />
                  <label className="block">
                    <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                      Monteur assigné
                    </span>

                    <Select value={project.installerId} onValueChange={assignInstaller}>
                      <SelectTrigger className="h-12 rounded-2xl border-white/10 bg-black/100 text-white font-semibold backdrop-blur-xl">
                        <SelectValue placeholder="Sélectionner un monteur" />
                      </SelectTrigger>

                      <SelectContent>
                        {installers.map((installer) => (
                          <SelectItem key={installer.id} value={installer.id}>
                            {installer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {selectedInstaller && (
                      <div className="mt-3 rounded-2xl bg-slate-50 p-3 text-sm font-semibold leading-6 text-slate-600">
                        <a
                          href={`tel:${selectedInstaller.phone.replace(/\s/g, "")}`}
                          className="inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-2 text-xs font-black text-white transition hover:bg-orange-500"
                        >
                         <Phone className="mr-2 h-4 w-4" />
                          Appeler {selectedInstaller.phone}
                        </a>
                      </div>
                    )}
                  </label>
                </div>

                <div className="mt-3 rounded-2xl border border-white/10 bg-black/40 p-3 backdrop-blur-xl">
                  <div className="text-xs font-black uppercase tracking-[0.16em] text-white/40">
                    Lien terrain
                  </div>

                  <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="break-all rounded-xl bg-white/[0.06] px-3 py-2 text-sm font-semibold leading-6 text-white/60">
                      {terrainLink}
                    </p>

                    <Button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(terrainLink)}
                      className="shrink-0 rounded-full bg-white font-black text-slate-950 hover:bg-orange-500 hover:text-white"
                    >
                      Copier
                    </Button>
                  </div>
                </div>

                <label className="mt-4 block">
                  <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-slate-400">Objectif visibilité</span>
                  <Textarea
                    value={project.objective}
                    onChange={(event) => updateProject("objective", event.target.value)}
                    placeholder="Décris l’objectif de visibilité de la marque sur cette mission..."
                    className="min-h-[110px] rounded-2xl border-white/10 bg-white/[0.08] font-medium leading-6 text-white placeholder:text-white/35"
                  />
                </label>
              </CardContent>
            </Card>

          {!selectedBrand && (
            <Card className="rounded-3xl border border-white/10 bg-white/[0.06] text-white shadow-xl shadow-black/10 backdrop-blur-xl">
              <CardContent className="p-5 md:p-6">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-500">
                  Inventaire marque
                </p>

                <h2 className="mt-1 text-2xl font-black tracking-[-0.04em]">
                  Sélectionne une marque
                </h2>

                <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                  L’inventaire apparaîtra ici une fois la marque associée à la mission.
                </p>
              </CardContent>
            </Card>
          )}

           {selectedBrand && (
            <Card className="rounded-[2rem] border-black/10 bg-white shadow-sm shadow-slate-200/60">
              <CardContent className="p-5 md:p-6">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-500">
                      Inventaire marque
                    </p>
                    <h2 className="mt-1 text-2xl font-black tracking-[-0.04em]">
                      Inventaire : {selectedBrand.name}
                    </h2>
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                      Recherche une référence, sélectionne-la, puis ajoute-la à la mission.
                    </p>
                  </div>

                  <Badge
                    variant="outline"
                    className="rounded-full border-black/10 bg-slate-50 text-slate-600"
                  >
                    {brandInventory.length} ref.
                  </Badge>
                </div>

                <form onSubmit={addInventoryItemToMission} className="grid gap-4">
                  <Input
                    value={inventorySelection.search}
                    onChange={(event) =>
                      setInventorySelection((current) => ({
                        ...current,
                        search: event.target.value,
                      }))
                    }
                    placeholder="Rechercher : arche, oriflamme, kakémono, état, note..."
                    className="h-12 rounded-2xl border-black/10 bg-white font-semibold"
                  />

                  <div className="grid gap-3 md:grid-cols-[1.3fr_100px_1fr_1fr]">
                    <Select
                      value={inventorySelection.itemId}
                      onValueChange={(value) =>
                        setInventorySelection((current) => ({
                          ...current,
                          itemId: value,
                        }))
                      }
                    >
                      <SelectTrigger className="h-12 rounded-2xl border-black/10 bg-white font-semibold">
                        <SelectValue placeholder="Sélectionner une référence" />
                      </SelectTrigger>

                      <SelectContent>
                        {filteredBrandInventory.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name} · Stock {item.quantityAvailable}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Input
                      value={inventorySelection.quantity}
                      onChange={(event) =>
                        setInventorySelection((current) => ({
                          ...current,
                          quantity: event.target.value,
                        }))
                      }
                      placeholder="Qté"
                      type="number"
                      min="1"
                      max={selectedInventoryItem?.quantityAvailable || 1}
                      className="h-12 rounded-2xl border-black/10 bg-white font-semibold"
                    />

                    <Select
                      value={inventorySelection.zone}
                      onValueChange={(value) =>
                        setInventorySelection((current) => ({
                          ...current,
                          zone: value,
                        }))
                      }
                    >
                      <SelectTrigger className="h-12 rounded-2xl border-black/10 bg-white font-semibold">
                        <SelectValue placeholder="Zone" />
                      </SelectTrigger>
                      <SelectContent>
                        {zones.map((zone) => (
                          <SelectItem key={zone} value={zone}>
                            {zone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={inventorySelection.priority}
                      onValueChange={(value) =>
                        setInventorySelection((current) => ({
                          ...current,
                          priority: value,
                        }))
                      }
                    >
                      <SelectTrigger className="h-12 rounded-2xl border-black/10 bg-white font-semibold">
                        <SelectValue placeholder="Priorité" />
                      </SelectTrigger>
                      <SelectContent>
                        {priorityOptions.map((priority) => (
                          <SelectItem key={priority.value} value={priority.value}>
                            {priority.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedInventoryItem && (
                    <div className="grid gap-4 rounded-3xl border border-black/10 bg-slate-50 p-4 md:grid-cols-[110px_1fr]">
                      <div className="h-28 w-full overflow-hidden rounded-2xl bg-white md:w-28">
                        <img
                          src={selectedInventoryItem.referencePhoto}
                          alt={selectedInventoryItem.name}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div>
                        <div className="flex flex-wrap gap-2">
                          <Badge className="rounded-full bg-orange-100 text-orange-800 hover:bg-orange-100">
                            {selectedInventoryItem.type}
                          </Badge>

                          <Badge
                            variant="outline"
                            className="rounded-full border-black/10 bg-white text-slate-600"
                          >
                            Stock disponible : {selectedInventoryItem.quantityAvailable}
                          </Badge>

                          <Badge
                            variant="outline"
                            className="rounded-full border-black/10 bg-white text-slate-600"
                          >
                            {selectedInventoryItem.condition}
                          </Badge>
                        </div>

                        <h3 className="mt-2 text-lg font-black tracking-[-0.03em] text-slate-950">
                          {selectedInventoryItem.name}
                        </h3>

                        <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
                          {selectedInventoryItem.note}
                        </p>
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={!selectedInventoryItem}
                    className="h-13 rounded-full bg-slate-950 font-black text-white hover:bg-orange-500 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter à la mission
                  </Button>
                </form>
              </CardContent>
            </Card>
            )}

            <Card className="rounded-[2rem] border border-white/10 bg-white/[0.06] text-white shadow-2xl shadow-black/20 backdrop-blur-xl">
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
            
            {mode === "terrain" && !isTerrainAccessGranted && (
              <Card className="rounded-[2rem] border-red-100 bg-red-50 shadow-none">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-1 h-5 w-5 text-red-600" />
                    <div>
                      <h2 className="text-xl font-black tracking-[-0.03em] text-red-700">
                        Accès terrain non autorisé
                      </h2>
                      <p className="mt-1 text-sm font-semibold leading-6 text-red-600">
                        Cette mission est accessible uniquement via le lien terrain généré pour le monteur assigné.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {mode === "terrain" && !isTerrainAccessGranted && (
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

            <Card className="rounded-3xl border border-white/10 bg-white/[0.06] text-white shadow-xl shadow-black/10 backdrop-blur-xl">
              <CardContent className="p-5 md:p-6">
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-500">Déploiement</p>
                    <h2 className="mt-1 text-2xl font-black tracking-[-0.04em]">Avancement terrain</h2>
                  </div>
                  <div className="text-right text-4xl font-black tracking-[-0.06em]">{stats.progress}%</div>
                </div>
                <Progress value={stats.progress} className="mt-5 h-3" />
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] border border-white/10 bg-white/[0.055] text-white backdrop-blur-xl">
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
                      <span>
                      {project.eventName}
                      {selectedBrand ? ` — ${selectedBrand.name}` : ""}
                      ,
                    </span>

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
                      Installation le {project.installDate} avant {project.installDeadline}
                      {" · "}
                      Organisateur : {project.fieldContact || "Non renseigné"}
                      {" · "}
                      Monteur : {selectedInstaller ? selectedInstaller.name : "Non assigné"}
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
                  <div className="rounded-3xl bg-white/7 p-4">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-black text-white/45">
                          Commentaires mission
                        </div>
                        <p className="mt-1 text-xs font-semibold text-white/45">
                          Notes partagées entre le donneur de mission et les monteurs.
                        </p>
                      </div>

                      <Badge className="rounded-full bg-white/10 text-white hover:bg-white/10">
                        {missionComments.length}
                      </Badge>
                    </div>

                    <form onSubmit={addMissionComment} className="grid gap-3">
                      <Textarea
                        value={missionComment}
                        onChange={(event) => setMissionComment(event.target.value)}
                        placeholder="Ajouter une remarque, une contrainte terrain, une info importante..."
                        className="min-h-[90px] rounded-2xl border-white/10 bg-white/10 font-medium leading-6 text-white placeholder:text-white/35"
                      />

                      <Button
                        type="submit"
                        className="rounded-full bg-orange-500 font-black text-white hover:bg-orange-600"
                      >
                        Ajouter le commentaire
                      </Button>
                    </form>

                    <div className="mt-4 space-y-3">
                      {missionComments.map((comment) => (
                        <div
                          key={comment.id}
                          className="rounded-2xl border border-white/10 bg-white/10 p-3"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Badge
                                className={`rounded-full ${
                                  comment.authorRole === "monteur"
                                    ? "bg-orange-500 text-white hover:bg-orange-500"
                                    : "bg-white text-slate-950 hover:bg-white"
                                }`}
                              >
                                {comment.authorName}
                              </Badge>
                            </div>

                            <span className="text-xs font-bold text-white/35">
                              {comment.createdAt}
                            </span>
                          </div>

                          <p className="mt-3 text-sm font-medium leading-6 text-white/75">
                            {comment.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

              {mode === "terrain" && isTerrainAccessGranted && (
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

        {mode !== "terrain" || isTerrainAccessGranted ? (
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

            {assets.length === 0 ? (
            <Card className="rounded-3xl border-dashed border-black/10 bg-white shadow-sm shadow-slate-200/60">
              <CardContent className="p-6">
                <div className="flex flex-col items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                    <Boxes className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="text-xl font-black tracking-[-0.03em] text-slate-950">
                      Aucun support ajouté
                    </h3>

                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                      Sélectionne une marque, puis ajoute les supports nécessaires depuis son inventaire pour construire cette mission.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            assets.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                mode={mode}
                onStatusChange={
                  mode === "terrain" && !isTerrainAccessGranted
                    ? () => {}
                    : updateAssetStatus
                }
                onDelete={deleteAsset}
                onPhotoUpload={
                  mode === "terrain" && !isTerrainAccessGranted
                    ? () => {}
                    : addAssetPhoto
                }
              />
            ))
          )}
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-500">Zones</p>
              <h2 className="text-3xl font-black tracking-[-0.05em]">Vue par emplacement</h2>
            </div>

            {groupedByZone.length === 0 ? (
              <Card className="rounded-3xl border-dashed border-black/10 bg-white shadow-sm shadow-slate-200/60">
                <CardContent className="p-6">
                  <div className="flex flex-col items-start gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                      <MapPin className="h-5 w-5" />
                    </div>

                    <div>
                      <h3 className="text-xl font-black tracking-[-0.03em] text-slate-950">
                        Aucune zone active
                      </h3>

                      <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                        Les zones apparaîtront automatiquement ici dès qu’un support sera ajouté à la mission.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              groupedByZone.map((group) => {
                const zoneDone = group.assets.filter((asset) =>
                  ["installe", "valide", "recupere"].includes(asset.status)
                ).length;

                const zoneProgress = Math.round((zoneDone / group.assets.length) * 100);

                return (
                  <Card
                    key={group.zone}
                    className="rounded-3xl border-black/10 bg-white shadow-sm shadow-slate-200/60"
                  >
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 text-lg font-black text-slate-950">
                            <MapPin className="h-5 w-5 text-orange-500" /> {group.zone}
                          </div>

                          <p className="mt-1 text-sm font-semibold text-slate-500">
                            {group.assets.length} support(s)
                          </p>
                        </div>

                        <div className="text-2xl font-black tracking-[-0.04em]">
                          {zoneProgress}%
                        </div>
                      </div>

                      <Progress value={zoneProgress} className="mt-4 h-2" />

                      <div className="mt-4 space-y-2">
                        {group.assets.map((asset) => (
                          <div
                            key={asset.id}
                            className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-2"
                          >
                            <div className="text-sm font-bold text-slate-700">
                              {asset.name}
                            </div>

                            <Badge
                              variant="outline"
                              className={`rounded-full border text-xs ${getStatus(asset.status).color}`}
                            >
                              {getStatus(asset.status).label}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </section>
        ) : null}
      </section>
    </main>
  );
  }

  return null;
}
