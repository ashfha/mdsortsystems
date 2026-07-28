import { useEffect, useMemo, useRef, useState, type ElementType, type RefObject } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Brain,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Compass,
  Heart,
  Hotel,
  ListChecks,
  MapPin,
  Plane,
  Route,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Wallet,
  Waves,
} from "lucide-react";
@@
-  function scrollTo(ref: React.RefObject<HTMLElement | null>) {
+  function scrollTo(ref: RefObject<HTMLElement | null>) {
     ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
   }
