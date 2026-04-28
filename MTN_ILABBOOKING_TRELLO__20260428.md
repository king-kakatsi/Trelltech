# Organisation du tableau Trello — MTN iLab Booking

**Dernière sync :** Aligné sur les 3 rapports dans `.hidden/2026-04-28/reviews/`  
- `SECURITY_AUDIT_REPORT_FR.md` (sécurité & dépendances)  
- `CODE_QUALITY_ARCH_REVIEW__entire-project__20260428.md` (qualité & architecture)  
- `report.md` (revue de code ultra‑détaillée, 15 findings + priorités)  

**Objectif :** transformer chaque finding en cartes actionnables, avec une exécution priorisée (P0 d’abord), puis intégrer les **tâches additionnelles Beta/UX**.

---

## Structure du board
- **Organisation :** IN_LAB
- **Board :** mtn_ilabbooking

---

## Listes
1. **backlog** — Toutes les tâches (triées par groupe + priorité)
2. **Approved** — Prêtes à être prises (scope clair, dépendances levées)
3. **In Progress** — En cours (1 owner)
4. **Blocked** — Bloquées (dépendance externe / décision / accès infra)
5. **Done** — Terminé (DoD respectée)

---

## Labels
- **P0-Critique** — Bloquant pré‑prod / risque sécurité / intégrité données
- **P1-Haute** — Important, doit suivre P0
- **P2-Moyenne** — Amélioration non bloquante mais utile
- **Back-end** — API, DB, cron, logique serveur
- **Front-end** — UI, pages, composants, BFF Next
- **Infra** — Secrets, env, déploiement, reverse proxy, observabilité
- **Security** — Auth, cookies, CSRF, headers, vulnérabilités
- **Quality** — Architecture, SRP/DRY/KISS, docs
- **Correctness** — Bugs fonctionnels, règles métier, conflits
- **Dependencies** — Mises à jour libs + audit
- **Beta** — Page /beta, opt-in/out, OTP, multi-step

---

## 📋 Cartes organisées par domaine

**Note :** chaque carte inclut une mini‑DoD (critères d’acceptation). Les checklists décrivent le “Done” concret.

---

## 🏗️ GROUPE 0 : Gate de lancement (P0)

### Carte : Rotation & purge des secrets committés (Git + environnements)
**Liste :** backlog  
**Labels :** P0-Critique, Security, Infra

**Description :**  
[INFRA] Les fichiers `api/src/config/config.env` et `api/src/config/config.env.example` contiennent des secrets committés (Graph, email, Typesense, JWT, Drive…).  
Objectif: **retirer du repo**, **rotater** tous les secrets exposés, et éviter toute ré‑introduction.

**Checklist :**
- [ ] Remplacer les valeurs sensibles de `config.env.example` par des placeholders (`CHANGEME`)
- [ ] Retirer `api/src/config/config.env` du dépôt (et l’ignorer via `.gitignore`)
- [ ] Rotation des secrets exposés (Graph, SMTP, Typesense, Google, JWT, etc.)
- [ ] Vérifier l’historique Git (si dépôt partagé): purge/rewriting si nécessaire (process validé)
- [ ] Documenter le provisioning (`docs/DEPLOYMENT.md` + `docs/INSTALLATION.md`)

**Critères d'acceptation :**
- Plus aucun secret utilisable ne vit dans Git (présent ou historique “accessible” selon politique)
- L’app démarre via variables d’environnement / secret manager

---

### Carte : Mise à jour dépendances vulnérables + audit “0 high/critical”
**Liste :** backlog  
**Labels :** P0-Critique, Dependencies, Security, Back-end, Front-end

**Description :**  
[BACK/FRONT] Les audits remontent des vulnérabilités **high/critical** sur `api/`, `frontend/admin`, `frontend/client` (ex: Next < 15.5.15, next-intl < 4.9.1, axios, jsonwebtoken/jws, dompurify, etc.).  
Objectif: upgrade + re‑audit jusqu’à **0 high/critical** (acceptable: modérées justifiées temporairement avec ticket).

**Checklist :**
- [ ] API: corriger les advisories high/critical (priorité axios, jsonwebtoken/jws, fast-xml-parser, socket.io-parser, dompurify…)
- [ ] Admin: upgrade `next` ≥ 15.5.15, `next-intl` ≥ 4.9.1, `postcss` ≥ 8.5.10
- [ ] Client: idem + corriger chaîne transitive `picomatch`
- [ ] Re-lancer audits et archiver les sorties (preuve)
- [ ] Vérifier régressions build/lint/tests

**Critères d'acceptation :**
- `audit` ne remonte **aucun** high/critical sur les 3 workspaces

---

### Carte : Security headers (CSP/HSTS/…)
**Liste :** backlog  
**Labels :** P0-Critique, Security, Back-end

**Description :**  
[BACK] Ajout de headers de sécurité (CSP, HSTS, frame-ancestors/XFO, nosniff, referrer-policy, permissions-policy).  
Objectif: réduire impact XSS/clickjacking/downgrade.

**Checklist :**
- [ ] Définir la politique CSP minimale (et exceptions nécessaires)
- [ ] Ajouter HSTS si HTTPS garanti au niveau reverse proxy
- [ ] Ajouter `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`
- [ ] Vérifier compatibilité avec frontends (assets, images, analytics)

**Critères d'acceptation :**
- Headers présents sur toutes les réponses HTTP pertinentes (prod)

---

### Carte : Rate limiting (auth + endpoints publics + upload)
**Liste :** backlog  
**Labels :** P0-Critique, Security, Back-end

**Description :**  
[BACK] Aucun rate limiting détecté. Priorité sur `register`, `login`, endpoints publics, upload base64 (DoS).

**Checklist :**
- [ ] Rate limit IP sur `/v1/users/auth/*`
- [ ] Rate limit par identité (email/token) là où pertinent
- [ ] Rate limit sur endpoints upload et endpoints publics sensibles
- [ ] Logs/metrics (compteurs, alerting de pics)

**Critères d'acceptation :**
- Brute-force et abus évidents sont efficacement ralentis/bloqués

---

## ✅ GROUPE 1 : Correctness & bugs fonctionnels (P0/P1)

### Carte : Anti‑conflit — empêcher les réservations qui se chevauchent
**Liste :** backlog  
**Labels :** P0-Critique, Correctness, Back-end, Réservations

**Description :**  
[BACK] Finding critique: absence de contrôle d’intersection des `slots` → deux réservations possibles sur le même créneau/espace.

**Checklist :**
- [ ] Définir la règle exacte de conflit (même espace + overlap temps)
- [ ] Ajouter la requête Mongo `$elemMatch` / `$lt` `$gt` avant insertion
- [ ] Gérer la concurrence (race condition): index/transaction/stratégie atomique
- [ ] Tests unitaires + test de concurrence minimal

**Critères d'acceptation :**
- Impossible de créer deux réservations qui se chevauchent selon la règle définie

---

### Carte : Candidatures — enlever la date limite codée en dur / rendre configurable
**Liste :** backlog  
**Labels :** P0-Critique, Correctness, Back-end, Front-end

**Description :**  
[BACK] Finding: date limite fixe (01/04/2026) bloque toutes les candidatures après cette date.

**Checklist :**
- [ ] Remplacer la date fixe par une variable d’environnement (ou config DB)
- [ ] Mettre à jour le message/erreur renvoyé
- [ ] Front: UX claire (afficher “candidatures fermées” si expiré)
- [ ] Tests: cas avant/après deadline

**Critères d'acceptation :**
- Les candidatures sont ouvertes/fermées selon une config, pas une constante

---

### Carte : Bug traduction équipements (amenities) — `StepRoomSelection.tsx`
**Liste :** backlog  
**Labels :** P1-Haute, Correctness, Front-end

**Description :**  
[FRONT] Finding: affichage de `space.nameEn` au lieu de `ressource.nameEn` pour les ressources.

**Checklist :**
- [ ] Corriger la source de libellé pour les ressources
- [ ] Vérifier FR/EN et fallback
- [ ] Retirer tout `console.log` résiduel du composant

**Critères d'acceptation :**
- Les équipements affichent le bon texte dans la bonne langue

---

## 🔐 GROUPE 2 : Auth/session (P0/P1)

### Carte : Cookies session sécurisés (httpOnly + sameSite + secure) — BFF Next
**Liste :** backlog  
**Labels :** P0-Critique, Security, Front-end, Auth

**Description :**  
[FRONT] Finding: cookies `token`/`user` posés côté Next sans `httpOnly` (et stratégies divergentes entre API et front).

**Checklist :**
- [ ] Mettre `httpOnly: true` sur le cookie de session quand possible
- [ ] Ajouter `sameSite` cohérent (Lax/Strict selon flux)
- [ ] Confirmer `secure` en prod uniquement
- [ ] Standardiser la durée (`maxAge`) + invalidation à la déconnexion

**Critères d'acceptation :**
- Les cookies sensibles ne sont pas lisibles par JS (réduction XSS)

---

### Carte : Contrat unique d’auth (cookie vs bearer, nom(s), responsabilités)
**Liste :** backlog  
**Labels :** P1-Haute, Quality, Security, Back-end, Front-end, Auth

**Description :**  
Incohérences: API pose `jwt`, front pose `token`; API renvoie aussi le token en JSON; usage bearer vs cookie varie.

**Checklist :**
- [ ] Décider la stratégie cible (cookie only recommandé pour web)
- [ ] Documenter le contrat (nom cookie, flags, durée, refresh, logout)
- [ ] Aligner API + admin + client sur ce contrat

**Critères d'acceptation :**
- Une seule stratégie documentée et appliquée sur l’ensemble des surfaces web

---

## 🧱 GROUPE 3 : Architecture & dette technique (P1/P2)

### Carte : Extraire une couche “services/use-cases” (controllers minces)
**Liste :** backlog  
**Labels :** P1-Haute, Quality, Back-end

**Description :**  
Les contrôleurs mélangent I/O fichier, DB, règles, intégrations. Objectif: rendre testable et lisible.

**Checklist :**
- [ ] Définir la convention (`src/services/` ou `src/use-cases/`)
- [ ] Migrer 1 vertical slice (ex: Spaces) comme exemple
- [ ] Garder contrôleurs: parse/validate → service → response mapping

**Critères d'acceptation :**
- Un contrôleur type devient résumable en 1 phrase, et testable via service

---

### Carte : Repositories explicites (éviter `mongo.<Collection>` dans les controllers)
**Liste :** backlog  
**Labels :** P2-Moyenne, Quality, Back-end

**Description :**  
Clarifier la frontière data-access (queries clés en repository).

**Checklist :**
- [ ] Définir méthodes repository pour queries/aggregations principales
- [ ] Remplacer l’accès direct dans les contrôleurs migrés

**Critères d'acceptation :**
- Les contrôleurs n’exécutent plus d’agrégations complexes inline

---

### Carte : Standardiser erreurs/logging (API + BFF Next)
**Liste :** backlog  
**Labels :** P2-Moyenne, Quality, Back-end, Front-end

**Description :**  
Consolidation: éviter `console.log` dans routes serveur, harmoniser shape des erreurs.

**Checklist :**
- [ ] Définir un format d’erreur unique (code, message, path)
- [ ] Logger structuré (au moins JSON en prod) + correlation id
- [ ] Remplacer logs ad hoc dans les BFF routes

**Critères d'acceptation :**
- Logs exploitables et erreurs homogènes

---

## 🧪 GROUPE 4 : Beta / OTP / Unsubscription / Multi-step (nouvelle feature)

### Carte : Bouton flottant Home → `/beta`
**Liste :** backlog  
**Labels :** P1-Haute, Front-end, Beta

**Description :**  
[FRONT] Ajouter un bouton flottant en bas à droite sur la home qui redirige vers `/beta`.

**Checklist :**
- [ ] Ajouter le bouton sur la home (client)
- [ ] Accessibilité: aria-label, focus visible
- [ ] Vérifier qu’il ne masque pas des CTA importants sur mobile

**Critères d'acceptation :**
- Bouton visible et fonctionnel desktop + mobile, sans casser l’UX

---

### Carte : `/beta` — Unsubscription par email + OTP (2 étapes)
**Liste :** backlog  
**Labels :** P0-Critique, Front-end, Back-end, Beta, Security

**Description :**  
Remplacer le popup “numéro” par **email**, puis afficher une vue OTP pour valider la désinscription.

**Checklist :**
- [ ] UI popup: saisie email → envoyer OTP → vue OTP → valider OTP
- [ ] API: endpoints “request-otp-unsubscribe” et “confirm-unsubscribe”
- [ ] Anti‑abus: rate limit + expiration OTP + tentative max

**Critères d'acceptation :**
- Désinscription impossible sans OTP valide; UX claire; anti‑brute‑force en place

---

### Carte : Unsubscription — suppression différée + délai configurable + rappel admin via cron
**Liste :** backlog  
**Labels :** P0-Critique, Back-end, Beta, Infra

**Description :**  
Ne pas supprimer immédiatement les données utilisateur. Les garder jusqu’à un délai configurable via `.env`. Après ce délai, cron envoie un email de rappel à l’admin.

**Checklist :**
- [ ] Ajouter un statut/horodatage de désinscription (soft delete) en DB
- [ ] Ajouter `UNSUBSCRIBE_RETENTION_DAYS` (ou similaire) en env
- [ ] Cron: détecter expirations → envoyer email admin → (option) purge finale
- [ ] Journaliser (audit log) les actions

**Critères d'acceptation :**
- Données conservées pendant le délai; rappel admin automatique; purge contrôlée

---

### Carte : Subscription — OTP popup à la soumission + création en DB après validation
**Liste :** backlog  
**Labels :** P0-Critique, Front-end, Back-end, Beta, Security

**Description :**  
Quand l’utilisateur remplit le formulaire et clique “subscribe”: afficher popup OTP, envoyer OTP email.  
**Sauvegarder en DB seulement après validation OTP**.

**Checklist :**
- [ ] API: request OTP (subscribe) + confirm OTP (subscribe)
- [ ] Stocker OTP hashé + TTL + tentative max
- [ ] UI: flow “form → OTP → succès”
- [ ] Empêcher double-submit / idempotence

**Critères d'acceptation :**
- Aucune inscription persistée sans OTP confirmé

---

### Carte : `/beta` — Formulaire multi‑étapes (au lieu “bulk form”)
**Liste :** backlog  
**Labels :** P1-Haute, Front-end, Beta, Quality

**Description :**  
Proposer un multi‑step form (progression, validation par étape) pour améliorer conversion et qualité des données.

**Checklist :**
- [ ] Découper en étapes (informations, consentement, récapitulatif, OTP)
- [ ] Validation par step (messages clairs)
- [ ] Persistance temporaire (state) + reprise simple si refresh (option)

**Critères d'acceptation :**
- UX plus claire; erreurs localisées; flow OTP intégré proprement

---

## 🔧 GROUPE 5 : Nettoyage “quick wins” (P2)

### Carte : Remplacer les constantes “en dur” (admins, Google Drive folder, base URL SEO)
**Liste :** backlog  
**Labels :** P2-Moyenne, Security, Quality, Back-end, Infra

**Description :**  
Findings: emails admins en dur, ID folder Drive en dur, base URL codée en dur.

**Checklist :**
- [ ] Déplacer vers env/config central
- [ ] Documenter les variables
- [ ] Garder des defaults sûrs pour dev uniquement

**Critères d'acceptation :**
- Aucune valeur sensible/opérationnelle n’est gravée dans le code

---

### Carte : Swagger `/v1/docs` — restreindre/désactiver en prod
**Liste :** backlog  
**Labels :** P2-Moyenne, Security, Back-end

**Description :**  
Limiter la surface de reconnaissance en prod.

**Checklist :**
- [ ] Conditionner l’exposition à `NODE_ENV !== production` ou auth admin
- [ ] Vérifier que la doc reste accessible en dev

**Critères d'acceptation :**
- Pas d’UI swagger publique en prod

