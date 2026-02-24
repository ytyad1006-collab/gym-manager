# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Supabase configuration

This project uses Supabase as a backend. **Do not commit your Supabase URL or key**
into source control. Instead, create a `.env` file at the root of the project and
add the following variables:

```text
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_KEY=<anon-or-service-role-key>
```

A template is provided in `.env.example`; the real `.env` file is ignored by
Git (see `.gitignore`). Vite makes these values available at runtime through
`import.meta.env` and `src/supabase.js` uses them to initialize the client.

### Database tables & access

For the React app to work you need two basic tables in your Supabase database:

```sql
create table members (
  id         uuid default uuid_generate_v4() primary key,
  user_id    uuid,         -- owner (auth.users.id)
  name       text not null,
  phone      text,
  plan       text,
  join_date  date,
  expiry_date date
);

create table payments (
  id         uuid default uuid_generate_v4() primary key,
  user_id    uuid,
  member_id  uuid references members(id),
  amount     numeric,
  method     text,
  created_at timestamp with time zone default now()
);
```

Row Level Security (RLS) is **enabled by default** in new Supabase projects. To
allow client-side inserts/queries you must either disable RLS for these tables or
add policies such as:

```sql
-- permit authenticated users to insert/select their own rows
create policy "members_owner"
  on members
  for select, insert, update, delete
  using (auth.uid() = user_id);

create policy "payments_owner"
  on payments
  for select, insert, update, delete
  using (auth.uid() = user_id);
```

You can define these in the SQL editor on app.supabase.com, or disable RLS if
you're just experimenting. Without the correct policies, `supabase.from("members").insert(...)` will
fail and return an error message which the UI now displays.


## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
