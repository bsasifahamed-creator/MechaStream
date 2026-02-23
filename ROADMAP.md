# MechaStream — Release roadmap

| Week   | Focus              | Status |
|--------|--------------------|--------|
| **1**  | Prompt 1 — Core pipeline (schema → generate → code → preview) | ✅ In place |
| **2**  | Prompt 2 — Export + deploy (ZIP, Vercel/Netlify, Studio Export tab) | ✅ In place |
| **3**  | Prompt 3 — Auth + dashboard (register/login, workspaces, projects, protected Studio) | ✅ In place |
| **4**  | Prompt 4 — Billing (plans, limits, Stripe, pricing page, UsageWidget) | 🔶 Started (plans config) |
| **5**  | Prompt 5 — Landing page | ⬜ Planned |
| **6+** | Test, fix, polish, launch | ⬜ Planned |

---

- **Week 1** → Core pipeline: make it work (schema types, validator, Ollama, code builder, Flask generate, Studio UI).
- **Week 2** → Export + deploy: exporter, export routes, Export tab, deploy routes, deploy UI.
- **Week 3** → Auth + dashboard: DB schema, auth service, middleware, auth/project routes, login/register, dashboard, ProtectedRoute, Studio save.
- **Week 4** → Billing: plan definitions, subscriptions/usage DB, limit service, limit middleware, Stripe, billing routes, pricing page, UsageWidget, LimitModal.
- **Week 5** → Landing page (marketing/home).
- **Week 6+** → Test, fix, polish, launch.
