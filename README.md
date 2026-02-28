# Ahmed Sattar Portfolio CMS

> Premium, minimal, editorial portfolio CMS built with **Astro + Tailwind CSS + Supabase**.

**Live:** Designer & Digital Marketer based in Baghdad, Iraq.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Astro 4 (static output) |
| Styling | Tailwind CSS + CSS custom properties |
| Backend/DB | Supabase (Postgres + Auth + Storage) |
| Hosting | Firebase Hosting **or** Cloudflare Pages |
| Fonts | Inter, DM Serif Display (Google Fonts) |

---

## Features

- **Premium design system** — CSS variables, dark/light mode, custom cursor
- **Boot island** — full progressive enhancement sequence
- **Block editor** — 16 content block types (title, paragraph, image, metrics, before/after, etc.)
- **3 project layouts** — grid, list (numbered + hover preview), bento
- **Photography gallery** — masonry with lightbox
- **Admin CMS** — projects, content, theme, layout, messages editors
- **Social links** — bug-proof module-scope state, reapplied after every rebuild
- **Skeleton loaders** — no layout shift
- **Reveal animations** — IntersectionObserver, respects `prefers-reduced-motion`
- **SEO** — og:image, Twitter card, canonical URLs per page
- **Hard reload support** — Firebase rewrites + Cloudflare `_redirects`

---

## Supabase Setup

### 1. Create project at [supabase.com](https://supabase.com)

### 2. Run SQL migrations

```sql
-- settings (ONE ROW)
create table if not exists settings (
  id uuid primary key default gen_random_uuid(),
  accent_color text,
  logo_text text,
  logo_mark_color text,
  font_display text,
  font_body text,
  dark_default boolean default false,
  instagram_url text,
  linkedin_url text,
  hero_size text default '1',
  body_size text default '1',
  radius text default '8px',
  nav_h text default '64px',
  section_pad text default '96px',
  card_gap text default '24px',
  updated_at timestamptz default now()
);

-- projects
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  status text default 'draft',
  category text,
  tags text[],
  year int,
  short_desc text,
  cover_url text,
  featured boolean default false,
  sort_order int default 0,
  role_badge text,
  timeline text,
  external_link text,
  content_blocks jsonb default '[]'::jsonb,
  seo_title text,
  seo_desc text,
  kind text default 'work',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- site_content
create table if not exists site_content (
  key text primary key,
  value jsonb
);

-- contact_messages
create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  read boolean default false,
  created_at timestamptz default now()
);

-- Row Level Security
alter table settings enable row level security;
alter table projects enable row level security;
alter table site_content enable row level security;
alter table contact_messages enable row level security;

-- Public read access for published content
create policy "Public read projects" on projects for select using (status = 'published');
create policy "Public read settings" on settings for select using (true);
create policy "Public read site_content" on site_content for select using (true);
create policy "Public insert messages" on contact_messages for insert with check (true);

-- Authenticated write access (for admin)
create policy "Auth write settings" on settings for all using (auth.role() = 'authenticated');
create policy "Auth write projects" on projects for all using (auth.role() = 'authenticated');
create policy "Auth write content" on site_content for all using (auth.role() = 'authenticated');
create policy "Auth read messages" on contact_messages for select using (auth.role() = 'authenticated');
create policy "Auth update messages" on contact_messages for update using (auth.role() = 'authenticated');
create policy "Auth delete messages" on contact_messages for delete using (auth.role() = 'authenticated');
```

### 3. Create storage bucket

```sql
-- Create public storage bucket
insert into storage.buckets (id, name, public) values ('projects', 'projects', true);
create policy "Public read storage" on storage.objects for select using (bucket_id = 'projects');
create policy "Auth upload storage" on storage.objects for insert using (auth.role() = 'authenticated');
create policy "Auth delete storage" on storage.objects for delete using (auth.role() = 'authenticated');
```

### 4. Create admin user

In Supabase dashboard → Authentication → Users → Invite user, or use:

```bash
# Using Supabase CLI
supabase auth admin create-user --email admin@example.com --password yourpassword
```

---

## Local Development

```bash
# 1. Clone and install
npm install

# 2. Set up environment
cp .env.example .env
# Fill in your Supabase URL and anon key

# 3. Start dev server
npm run dev
# → http://localhost:4321

# 4. Admin panel
# → http://localhost:4321/admin/login
```

---

## Production Deploy

### Cloudflare Pages (Recommended)

1. Push to GitHub
2. Connect repo in Cloudflare Pages dashboard
3. Build command: `npm run build`
4. Output directory: `dist`
5. Environment variables: `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`

The `public/_redirects` file handles client-side routing automatically.

### Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login and init
firebase login
firebase init hosting
# Use existing firebase.json config

# Deploy
npm run build
firebase deploy --only hosting
```

---

## Admin Panel Routes

| Route | Description |
|---|---|
| `/admin/login` | Admin authentication |
| `/admin` | Dashboard with stats |
| `/admin/work` | Work projects (drag reorder) |
| `/admin/personal` | Personal projects |
| `/admin/photography` | Photography gallery manager |
| `/admin/project/new` | Create new project |
| `/admin/project/[slug]` | Edit project + block editor |
| `/admin/content` | Site text content editor |
| `/admin/theme` | Theme & design tokens editor |
| `/admin/layout` | Page layout configuration |
| `/admin/messages` | Contact form messages |

---

## Architecture

```
src/
├── layouts/
│   ├── BaseLayout.astro      # Global HTML shell with all element IDs
│   └── AdminLayout.astro     # Admin sidebar layout
├── pages/
│   ├── index.astro           # Home (6 sections)
│   ├── work/
│   │   ├── index.astro       # Work listing (grid/list/bento)
│   │   └── [slug].astro      # Work project detail
│   ├── personal/
│   │   ├── index.astro       # Personal projects
│   │   └── [slug].astro      # Personal project detail
│   ├── photography.astro     # Photography gallery
│   ├── about.astro           # About page
│   ├── contact.astro         # Contact form
│   └── admin/                # Admin CMS pages
├── islands/
│   └── Boot.ts               # Full boot sequence island
├── lib/
│   ├── supabaseClient.ts     # Supabase client
│   └── services/
│       ├── settings.ts       # Settings CRUD (bug-proof save)
│       ├── projects.ts       # Projects CRUD
│       ├── siteContent.ts    # Site content CRUD
│       ├── messages.ts       # Contact messages
│       ├── storage.ts        # File uploads
│       └── auth.ts           # Authentication
└── styles/
    └── global.css            # Design tokens + global styles
```

---

## Customization

### Changing accent color

In admin: **Theme Editor** → Accent Color

Or directly in CSS: `--accent: #your-color;`

### Adding custom fonts

1. Add Google Font link to `BaseLayout.astro`
2. Add to the font options in `admin/theme.astro`
3. Update `tailwind.config.js` if needed

### Replacing placeholder images

Search for `picsum.photos` comments in the codebase — all are clearly labeled as `<!-- PLACEHOLDER -->`.

---

## License

Private — All rights reserved. Ahmed Sattar Portfolio CMS.
