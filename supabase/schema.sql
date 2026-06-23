-- =====================================================================
-- SHADOW GYM - Schéma Supabase
-- =====================================================================
-- À exécuter dans l'éditeur SQL de Supabase (SQL Editor → New query → Run).
-- Crée les tables, la sécurité (RLS) et les automatismes nécessaires
-- aux classements et aux challenges entre joueurs.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. TABLE PROFILES (un Hunter = une ligne, miroir du store local)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
    id              uuid primary key references auth.users(id) on delete cascade,
    name            text not null default 'Shadow Hunter',
    title           text default '★ RISING HUNTER ★',
    avatar          text default 'fa-user-ninja',
    avatar_color    text default '#85acb9',
    level           int  not null default 1,
    xp              int  not null default 0,
    total_xp        int  not null default 0,
    rank            text not null default 'E',
    str             int  default 10,
    agi             int  default 10,
    endurance       int  default 10,          -- "end" est un mot réservé SQL
    vit             int  default 100,
    total_workouts  int  default 0,
    current_streak  int  default 0,
    longest_streak  int  default 0,
    combat_power    int  default 600,
    achievements    jsonb default '["AWAKENED"]'::jsonb,
    guild           text,
    country         text,
    created_at      timestamptz default now(),
    updated_at      timestamptz default now()
);

-- Index pour des classements rapides
create index if not exists profiles_combat_power_idx on public.profiles (combat_power desc);
create index if not exists profiles_total_xp_idx     on public.profiles (total_xp desc);
create index if not exists profiles_rank_idx         on public.profiles (rank);

-- ---------------------------------------------------------------------
-- 2. SÉCURITÉ (Row Level Security)
--    Lecture publique (classement visible par tous),
--    écriture limitée à son propre profil.
-- ---------------------------------------------------------------------
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all"
    on public.profiles for select
    using (true);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
    on public.profiles for insert
    with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
    on public.profiles for update
    using (auth.uid() = id);

-- ---------------------------------------------------------------------
-- 3. CRÉATION AUTOMATIQUE DU PROFIL À L'INSCRIPTION
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
    insert into public.profiles (id, name)
    values (
        new.id,
        coalesce(new.raw_user_meta_data->>'name', 'Shadow Hunter')
    )
    on conflict (id) do nothing;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- 4. TABLE CHALLENGES (duels entre Hunters)
-- ---------------------------------------------------------------------
create table if not exists public.challenges (
    id                  uuid primary key default gen_random_uuid(),
    challenger          uuid references public.profiles(id) on delete cascade,
    opponent            uuid references public.profiles(id) on delete cascade,
    type                text default 'xp',        -- xp | workouts | streak
    goal                int  default 500,
    status              text default 'pending',   -- pending | active | completed | declined
    challenger_start    int  default 0,
    opponent_start      int  default 0,
    challenger_progress int  default 0,
    opponent_progress   int  default 0,
    winner              uuid,
    message             text,
    created_at          timestamptz default now(),
    ends_at             timestamptz default (now() + interval '7 days')
);

create index if not exists challenges_challenger_idx on public.challenges (challenger);
create index if not exists challenges_opponent_idx   on public.challenges (opponent);
create index if not exists challenges_status_idx     on public.challenges (status);

alter table public.challenges enable row level security;

-- On ne voit que les challenges qui nous concernent
drop policy if exists "challenges_select_own" on public.challenges;
create policy "challenges_select_own"
    on public.challenges for select
    using (auth.uid() = challenger or auth.uid() = opponent);

-- On ne peut créer un défi que comme challenger
drop policy if exists "challenges_insert_own" on public.challenges;
create policy "challenges_insert_own"
    on public.challenges for insert
    with check (auth.uid() = challenger);

-- Les deux participants peuvent mettre à jour (accepter, progresser)
drop policy if exists "challenges_update_participant" on public.challenges;
create policy "challenges_update_participant"
    on public.challenges for update
    using (auth.uid() = challenger or auth.uid() = opponent);

-- ---------------------------------------------------------------------
-- 5. VUE CLASSEMENT PUBLIC (sans données sensibles)
-- ---------------------------------------------------------------------
create or replace view public.leaderboard as
select
    id, name, title, avatar, level, rank,
    total_xp, combat_power, longest_streak, total_workouts, guild, country,
    rank() over (order by combat_power desc) as position
from public.profiles
order by combat_power desc;

-- ---------------------------------------------------------------------
-- 6. GUILDES (rejoins des alliés, cumule la puissance)
-- ---------------------------------------------------------------------
create table if not exists public.guilds (
    id          uuid primary key default gen_random_uuid(),
    name        text unique not null,
    tag         text,
    emblem      text default 'fa-shield-halved',
    color       text default '#85acb9',
    description text,
    owner       uuid references public.profiles(id) on delete set null,
    created_at  timestamptz default now()
);

create table if not exists public.guild_members (
    guild_id  uuid references public.guilds(id) on delete cascade,
    user_id   uuid references public.profiles(id) on delete cascade,
    role      text default 'member',
    joined_at timestamptz default now(),
    primary key (guild_id, user_id),
    unique (user_id)               -- un Hunter ne peut être que dans une seule guilde
);

alter table public.guilds enable row level security;
alter table public.guild_members enable row level security;

drop policy if exists "guilds_select_all" on public.guilds;
create policy "guilds_select_all" on public.guilds for select using (true);
drop policy if exists "guilds_insert_auth" on public.guilds;
create policy "guilds_insert_auth" on public.guilds for insert with check (auth.uid() = owner);
drop policy if exists "guilds_update_owner" on public.guilds;
create policy "guilds_update_owner" on public.guilds for update using (auth.uid() = owner);
drop policy if exists "guilds_delete_owner" on public.guilds;
create policy "guilds_delete_owner" on public.guilds for delete using (auth.uid() = owner);

drop policy if exists "gm_select_all" on public.guild_members;
create policy "gm_select_all" on public.guild_members for select using (true);
drop policy if exists "gm_insert_self" on public.guild_members;
create policy "gm_insert_self" on public.guild_members for insert with check (auth.uid() = user_id);
drop policy if exists "gm_delete_self" on public.guild_members;
create policy "gm_delete_self" on public.guild_members for delete using (auth.uid() = user_id);

-- Classement des guildes (membres + puissance cumulée)
create or replace view public.guild_rankings as
select g.id, g.name, g.tag, g.emblem, g.color, g.description, g.owner,
    count(gm.user_id)                  as member_count,
    coalesce(sum(p.combat_power), 0)   as total_power
from public.guilds g
left join public.guild_members gm on gm.guild_id = g.id
left join public.profiles p       on p.id = gm.user_id
group by g.id;

-- =====================================================================
-- FIN — Active "Realtime" sur les tables `profiles`, `challenges`,
-- `guilds` et `guild_members` (Database → Replication) pour le live.
-- =====================================================================
