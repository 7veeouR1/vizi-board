import React, { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { jsPDF } from "jspdf";
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
import { supabase } from "./lib/supabase";

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

const defaultProject = {
  id: "",
  eventName: "",
  brandId: "",
  location: "",
  date: "",
  installDate: "",
  installDeadline: "",
  fieldContact: "",
  objective:"",
  installerId: "",
};

const defaultAssets = [];

const DEMO_TERRAIN_TOKEN = "vizi-demo-token";

function isValidUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

const defaultMissions = [
  {
    id: "mission-demo-001",
    eventName: "Activation été — Lac du Bourget",
    brandName: "Explore Savoie",
    location: "Aix-les-Bains",
    installDate: "2026-06-17",
    status: "draft",
    statusLabel: "Brouillon",
    mapPosition: { x: 48, y: 62 },
  },
  {
    id: "mission-demo-002",
    eventName: "Trail des Bauges",
    brandName: "Explore Savoie",
    location: "Le Châtelard",
    installDate: "2026-06-04",
    status: "submitted_by_installer",
    statusLabel: "À valider",
    mapPosition: { x: 56, y: 48 },
  },
  {
    id: "mission-demo-003",
    eventName: "Salon outdoor Savoie",
    brandName: "Explore Savoie",
    location: "Chambéry",
    installDate: "2026-07-12",
    status: "assigned",
    statusLabel: "Assignée",
    mapPosition: { x: 42, y: 70 },
  },
  {
    id: "mission-demo-004",
    eventName: "Test PLV printemps",
    brandName: "Explore Savoie",
    location: "Annecy",
    installDate: "2026-05-12",
    status: "validated_by_provider",
    statusLabel: "Validée",
    mapPosition: { x: 40, y: 68 },
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

function getMissionStatusLabel(status) {
  const labels = {
    draft: "Brouillon",
    assigned: "Assignée",
    in_progress: "En cours",
    submitted_by_installer: "À valider",
    validated_by_provider: "Validée",
    report_sent: "Rapport envoyé",
  };

  return labels[status] || "Brouillon";
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
  const [brands, setBrands] = useState([]);
  const [inventory] = useState(defaultInventory);
  const [mode, setMode] = useState("admin");
  const [missionCompleted, setMissionCompleted] = useState(false);
  const [providerValidated, setProviderValidated] = useState(false);
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

const [installers, setInstallers] = useState([]);

const [currentUser, setCurrentUser] = useState(null);

console.log("BRANDS STATE:", brands);
console.log("PROJECT BRAND ID:", project.brandId);

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

useEffect(() => {
  async function loadSession() {
    const { data } = await supabase.auth.getSession();
    const session = data.session;

    if (!session?.user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    setCurrentUser({
      id: session.user.id,
      email: session.user.email,
      name: profile?.full_name || session.user.email,
      role: profile?.role || "provider",
    });

    setIsAuthenticated(true);

    if (!hasTerrainParams) {
      setCurrentScreen("dashboard");
    }
  }

  loadSession();
}, [hasTerrainParams]);


useEffect(() => {
  if (isAuthenticated && currentUser?.id) {
    loadMissions(currentUser.id);
    loadBrands(currentUser.id);
    loadInstallers(currentUser.id);
  }
}, [isAuthenticated, currentUser?.id]);

  function addAssetPhoto(assetId, file) {
  if (!file) return;

  const reader = new FileReader();

  reader.onloadend = () => {
    const photoBase64 = reader.result;

    setAssets((current) =>
      current.map((asset) =>
        asset.id === assetId
          ? {
              ...asset,
              photos: [...(asset.photos || []), photoBase64],
            }
          : asset
      )
    );
  };

  reader.readAsDataURL(file);
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

async function handleLogin(event) {
  event.preventDefault();
  setLoginError("");

  const { data, error } = await supabase.auth.signInWithPassword({
    email: loginForm.email.trim(),
    password: loginForm.password,
  });

  if (error) {
    setLoginError("Identifiants incorrects.");
    return;
  }

  const user = data.user;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  setCurrentUser({
    id: user.id,
    email: user.email,
    name: profile?.full_name || user.email,
    role: profile?.role || "provider",
  });

  setIsAuthenticated(true);
  setCurrentScreen("dashboard");
}

async function logout() {
  await supabase.auth.signOut();

  setCurrentUser(null);
  setIsAuthenticated(false);
  setCurrentScreen("login");
  setLoginForm({ email: "", password: "" });
}

async function openMission(missionId) {
  if (!currentUser?.id) return;

  const { data, error } = await supabase
    .from("missions")
    .select("*")
    .eq("id", missionId)
    .eq("owner_id", currentUser.id)
    .single();

  if (error) {
    console.error("Erreur ouverture mission :", error);
    return;
  }

  setProject({
    ...defaultProject,
    id: data.id,
    eventName: data.event_name || "",
    brandId: data.brand_id || "",
    installerId: data.installer_id || "",
    location: data.location || "",
    date: data.event_date || "",
    installDate: data.install_date || "",
    installDeadline: data.install_deadline || "",
    fieldContact: data.field_contact || "",
    objective: data.objective || "",
    terrainToken: data.terrain_token,
  });

  setAssets([]);
  setActiveMissionId(data.id);
  setCurrentScreen("mission");
}

async function createNewMission() {
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();

  if (sessionError) {
    console.error("Erreur session :", sessionError);
    return;
  }

  const userId = sessionData.session?.user?.id;

  if (!userId) {
    console.error("Aucune session Supabase active");
    setCurrentScreen("login");
    return;
  }

  const payload = {
    owner_id: userId,
    event_name: "Nouvelle mission",
    location: "",
    install_date: null,
    install_deadline: null,
    field_contact: "",
    objective: "",
    status: "draft",
  };

  console.log("CREATE MISSION PAYLOAD:", payload);

  const { data, error } = await supabase
    .from("missions")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    console.error("Erreur création mission :", error);
    return;
  }

  setProject({
    ...defaultProject,
    id: data.id,
    eventName: data.event_name,
    brandId: data.brand_id || "",
    installerId: data.installer_id || "",
    location: data.location || "",
    date: "",
    installDate: data.install_date || "",
    installDeadline: data.install_deadline || "",
    fieldContact: data.field_contact || "",
    objective: data.objective || "",
    terrainToken: data.terrain_token,
  });

  setAssets([]);
  setActiveMissionId(data.id);
  setCurrentScreen("mission");

  await loadMissions(userId);
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

function validateMissionByProvider() {
  if (!missionCompleted) {
    setCompletionError(
      "Le monteur doit terminer le montage avant validation donneur."
    );
    return;
  }

  if (totalPhotos === 0) {
    setCompletionError(
      "Impossible de valider la mission sans preuve photo."
    );
    return;
  }

  setProviderValidated(true);
  setCompletionError("");
}

async function generateMissionPdf() {
  if (!providerValidated) {
    setCompletionError(
      "Valide d’abord la mission côté donneur avant de générer le PDF."
    );
    return;
  }

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  let y = 18;

  function addText(text, x, yPosition, options = {}) {
    const {
      size = 10,
      style = "normal",
      color = [30, 41, 59],
      maxWidth = pageWidth - 28,
    } = options;

    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    doc.setTextColor(...color);

    const lines = doc.splitTextToSize(text || "-", maxWidth);
    doc.text(lines, x, yPosition);

    return yPosition + lines.length * (size * 0.42) + 3;
  }

  function addSectionTitle(title) {
    if (y > pageHeight - 30) {
      doc.addPage();
      y = 18;
    }

    doc.setFillColor(249, 115, 22);
    doc.roundedRect(14, y, 4, 4, 1, 1, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text(title, 22, y + 4);

    y += 12;
  }

  function ensureSpace(requiredHeight = 35) {
    if (y + requiredHeight > pageHeight - 16) {
      doc.addPage();
      y = 18;
    }
  }

  // Header
  doc.setFillColor(5, 11, 20);
  doc.rect(0, 0, pageWidth, 38, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text("Vizi Board", 14, 18);

  doc.setFontSize(10);
  doc.setTextColor(180, 190, 205);
  doc.text("Récapitulatif de mission terrain", 14, 27);

  doc.setFillColor(249, 115, 22);
  doc.roundedRect(pageWidth - 52, 12, 38, 11, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("VALIDÉE", pageWidth - 42, 19);

  y = 50;

  // Mission
  addSectionTitle("Informations mission");

  y = addText(`Mission : ${project.eventName}`, 14, y, {
    size: 12,
    style: "bold",
  });

  y = addText(`Marque : ${selectedBrand?.name || "Non renseignée"}`, 14, y);
  y = addText(`Lieu : ${project.location || "Non renseigné"}`, 14, y);
  y = addText(
    `Installation : ${project.installDate || "Date non renseignée"} avant ${
      project.installDeadline || "heure non renseignée"
    }`,
    14,
    y
  );
  y = addText(
    `Contact organisateur : ${project.fieldContact || "Non renseigné"}`,
    14,
    y
  );
  y = addText(
    `Monteur : ${selectedInstaller?.name || "Non assigné"}`,
    14,
    y
  );

  y += 4;

  addSectionTitle("Objectif visibilité");

  y = addText(project.objective || "Aucun objectif renseigné.", 14, y, {
    maxWidth: pageWidth - 28,
  });

  y += 4;

  addSectionTitle("Supports déployés");

  if (assets.length === 0) {
    y = addText("Aucun support ajouté à cette mission.", 14, y);
  } else {
    assets.forEach((asset, index) => {
      ensureSpace(28);

      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, y - 5, pageWidth - 28, 24, 3, 3, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text(`${index + 1}. ${asset.name}`, 18, y + 1);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text(
        `Type : ${asset.type} | Qté : ${asset.quantity} | Zone : ${asset.zone} | Statut : ${
          getStatus(asset.status).label
        }`,
        18,
        y + 8
      );

      const noteLines = doc.splitTextToSize(
        `Note : ${asset.note || "-"}`,
        pageWidth - 40
      );
      doc.text(noteLines, 18, y + 15);

      y += 30;
    });
  }

  y += 2;

  addSectionTitle("Commentaires mission");

  if (!missionComments || missionComments.length === 0) {
    y = addText("Aucun commentaire mission.", 14, y);
  } else {
    missionComments.forEach((comment) => {
      ensureSpace(24);

      y = addText(
        `${comment.authorName} - ${comment.createdAt}`,
        14,
        y,
        {
          size: 9,
          style: "bold",
        }
      );

      y = addText(comment.message, 14, y, {
        size: 9,
        color: [71, 85, 105],
      });

      y += 2;
    });
  }

  y += 4;

  addSectionTitle("Preuves photo");

  const proofPhotos = assets.flatMap((asset) =>
    (asset.photos || []).map((photo) => ({
      assetName: asset.name,
      zone: asset.zone,
      photo,
    }))
  );

  if (proofPhotos.length === 0) {
    y = addText("Aucune preuve photo ajoutée.", 14, y);
  } else {
    for (const proof of proofPhotos) {
      ensureSpace(70);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text(`${proof.assetName} - ${proof.zone}`, 14, y);

      try {
        doc.addImage(proof.photo, "JPEG", 14, y + 5, 80, 55);
      } catch (error) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(220, 38, 38);
        doc.text("Photo non compatible avec l’export PDF.", 14, y + 10);
      }

      y += 68;
    }
  }

  // Footer
  const totalPages = doc.internal.getNumberOfPages();

  for (let page = 1; page <= totalPages; page += 1) {
    doc.setPage(page);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Vizi Board - Rapport généré le ${new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date())}`,
      14,
      pageHeight - 10
    );
    doc.text(`${page}/${totalPages}`, pageWidth - 22, pageHeight - 10);
  }

  const safeName = (project.eventName || "mission")
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "");

  doc.save(`vizi-board-${safeName}.pdf`);
}

async function loadMissions(userId = currentUser?.id) {
  if (!userId) return;

  const { data, error } = await supabase
    .from("missions")
    .select(`
      id,
      event_name,
      location,
      install_date,
      status,
      terrain_token,
      brands(name),
      installers(name)
    `)
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erreur chargement missions :", error);
    return;
  }

  const formattedMissions = data.map((mission) => ({
    id: mission.id,
    eventName: mission.event_name || "Mission sans nom",
    brandName: mission.brands?.name || "Marque non définie",
    location: mission.location || "Lieu à définir",
    installDate: mission.install_date || "",
    status: mission.status || "draft",
    statusLabel: getMissionStatusLabel(mission.status),
    terrainToken: mission.terrain_token,
  }));

  setMissions(formattedMissions);
}

async function saveMissionToSupabase() {
  if (!project.id || !currentUser?.id) return;

  const payload = {
    event_name: project.eventName || "Mission sans nom",
    brand_id: isValidUuid(project.brandId) ? project.brandId : null,
    installer_id: isValidUuid(project.installerId) ? project.installerId : null,
    location: project.location || "",
    install_date: project.installDate || null,
    install_deadline: project.installDeadline || null,
    field_contact: project.fieldContact || "",
    objective: project.objective || "",
    status: isValidUuid(project.installerId) ? "assigned" : "draft",
  };

  const { data, error } = await supabase
    .from("missions")
    .update(payload)
    .eq("id", project.id)
    .eq("owner_id", currentUser.id)
    .select("*")
    .single();

  if (error) {
    console.error("Erreur sauvegarde mission :", error);
    return;
  }

  console.log("Mission enregistrée :", data);

  await loadMissions(currentUser.id);

  setCurrentScreen("dashboard");
}

async function loadBrands(userId = currentUser?.id) {
  if (!userId) return;

  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .eq("owner_id", userId)
    .order("name", { ascending: true });

  if (error) {
    console.error("Erreur chargement marques :", error);
    return;
  }

  console.log("BRANDS LOADED:", data);
  setBrands(data || []);
}

async function loadInstallers(userId = currentUser?.id) {
  if (!userId) return;

  const { data, error } = await supabase
    .from("installers")
    .select("*")
    .eq("owner_id", userId)
    .order("name", { ascending: true });

  if (error) {
    console.error("Erreur chargement monteurs :", error);
    return;
  }

  console.log("INSTALLERS LOADED:", data);
  setInstallers(data || []);
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
  <CardContent className="p-5 md:p-6">
    <div className="mb-5 flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-400">
          Carte missions
        </p>

        <h2 className="mt-1 text-2xl font-black tracking-[-0.04em]">
          Déploiements terrain
        </h2>

        <p className="mt-2 text-sm font-semibold leading-6 text-white/45">
          Vue rapide des missions planifiées, en cours ou à valider.
        </p>
      </div>

      <Badge
        variant="outline"
        className="rounded-full border-white/10 bg-white/[0.06] text-white/60"
      >
        {missions.length} mission(s)
      </Badge>
    </div>

    <div className="relative h-[360px] overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#07111C]">
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.12)_1px,transparent_1px)] bg-[size:22px_22px] opacity-35" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.04),transparent)]" />

      <div className="absolute left-[10%] top-[18%] text-xs font-black uppercase tracking-[0.18em] text-white/15">
        Savoie
      </div>

      <div className="absolute bottom-[12%] right-[10%] text-xs font-black uppercase tracking-[0.18em] text-white/15">
        Alpes
      </div>

      {missions
        .filter((mission) => mission.mapPosition)
        .map((mission) => (
          <button
            key={mission.id}
            type="button"
            onClick={() => openMission(mission.id)}
            className="group absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
            style={{
              left: `${mission.mapPosition.x}%`,
              top: `${mission.mapPosition.y}%`,
            }}
          >
            <span className="relative flex h-4 w-4">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-40" />
              <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-white bg-orange-500" />
            </span>

            <span className="pointer-events-none mt-2 min-w-[180px] rounded-2xl border border-white/10 bg-black/75 px-3 py-2 text-left text-xs font-semibold text-white opacity-0 backdrop-blur-xl transition group-hover:opacity-100">
              <span className="block font-black">{mission.eventName}</span>
              <span className="mt-1 block text-white/50">
                {mission.location} · {mission.statusLabel}
              </span>
            </span>
          </button>
        ))}
    </div>
  </CardContent>
</Card>

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

            <Button
              type="button"
              onClick={saveMissionToSupabase}
              className="rounded-full bg-orange-500 font-black text-white hover:bg-orange-600"
            >
              Enregistrer
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
                          value={project.brandId || ""}
                          onValueChange={(value) => updateProject("brandId", value)}
                        >
                          <SelectTrigger className="h-12 rounded-2xl border-white/10 bg-[#101826] text-white font-semibold">
                            <SelectValue placeholder="Sélectionner une marque" />
                          </SelectTrigger>

                          <SelectContent
                            className="z-50 rounded-2xl border border-white/10 bg-[#0D1522] p-2 text-white shadow-2xl"
                            position="popper"
                          >
                            {brands.map((brand) => (
                              <SelectItem
                                key={brand.id}
                                value={brand.id}
                                className="rounded-xl px-3 py-2 !text-white focus:!bg-[#182538] focus:!text-white data-[highlighted]:!bg-[#182538] data-[highlighted]:!text-white data-[state=checked]:!bg-[#1F2D42] data-[state=checked]:!text-white">
                                  <span className="!text-white">{brand.name}</span>
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

                    <Select
                      value={project.installerId || ""}
                      onValueChange={(value) => updateProject("installerId", value)}
                    >
                      <SelectTrigger className="h-12 rounded-2xl border border-white/10 bg-[#0D1522]/80 text-white font-semibold backdrop-blur-xl">
                        <SelectValue placeholder="Sélectionner un monteur" />
                      </SelectTrigger>

                      <SelectContent
                        className="z-50 rounded-2xl border border-white/10 bg-[#0D1522] p-2 text-white shadow-2xl"
                        position="popper"
                      >
                        {installers.map((installer) => (
                          <SelectItem
                            key={installer.id}
                            value={installer.id}
                            className="rounded-xl px-3 py-2 !text-white focus:!bg-[#182538] data-[highlighted]:!bg-[#182538]"
                          >
                            <span className="!text-white">
                              {installer.name}
                            </span>
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
                      <SelectTrigger className="h-12 rounded-2xl border-white/10 bg-black/100 text-white font-semibold backdrop-blur-xl">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {assetTypes.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                      </SelectContent>
                    </Select>

                    <Select value={newAsset.zone} onValueChange={(value) => setNewAsset((current) => ({ ...current, zone: value }))}>
                      <SelectTrigger className="h-12 rounded-2xl border-white/10 bg-black/100 text-white font-semibold backdrop-blur-xl">
                        <SelectValue placeholder="Zone" />
                      </SelectTrigger>
                      <SelectContent>
                        {zones.map((zone) => <SelectItem key={zone} value={zone}>{zone}</SelectItem>)}
                      </SelectContent>
                    </Select>

                    <Select value={newAsset.priority} onValueChange={(value) => setNewAsset((current) => ({ ...current, priority: value }))}>
                      <SelectTrigger className="h-12 rounded-2xl border-white/10 bg-black/100 text-white font-semibold backdrop-blur-xl">
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
                      className="h-12 rounded-2xl border-white/10 bg-black/100 text-white font-semibold backdrop-blur-xl"
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

            {currentScreen === "mission" && (
              <Card className="rounded-[2rem] border border-white/10 bg-[#0B1624]/85 text-white backdrop-blur-xl">
                <CardContent className="p-5 md:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-400">
                        Validation donneur
                      </p>

                      <h2 className="mt-1 text-2xl font-black tracking-[-0.04em]">
                        Rapport marque
                      </h2>

                      <p className="mt-2 text-sm font-semibold leading-6 text-white/50">
                        Vérifie les preuves terrain, valide la mission, puis génère le PDF récapitulatif à envoyer à la marque.
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button
                        type="button"
                        onClick={validateMissionByProvider}
                        disabled={!missionCompleted}
                        className="rounded-full bg-white font-black text-slate-950 hover:bg-orange-500 hover:text-white disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/35"
                      >
                        Valider donneur
                      </Button>

                      <Button
                        type="button"
                        onClick={generateMissionPdf}
                        disabled={!providerValidated}
                        className="rounded-full bg-orange-500 font-black text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/35"
                      >
                        Générer PDF
                      </Button>
                    </div>
                  </div>

                  {!missionCompleted && (
                    <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm font-semibold text-white/45">
                      En attente de soumission terrain par le monteur.
                    </div>
                  )}

                  {missionCompleted && !providerValidated && (
                    <div className="mt-4 rounded-2xl border border-orange-400/20 bg-orange-500/10 p-4 text-sm font-semibold text-orange-200">
                      Mission soumise par le monteur. Validation donneur requise avant génération du PDF.
                    </div>
                  )}

                  {providerValidated && (
                    <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm font-semibold text-emerald-200">
                      Mission validée par le donneur. Le PDF récapitulatif peut être généré.
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

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
