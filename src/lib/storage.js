import { supabase } from "./supabaseClient";

const TABLE = "ideas";

function mapRow(row) {
  return {
    id: row.id,
    num: row.num,
    title: row.title,
    note: row.note || "",
    link: row.link || "",
    deadline: row.deadline || "",
    status: row.status,
    tags: row.tags || [],
    createdAt: row.created_at,
  };
}

export async function fetchIdeas() {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("num", { ascending: false });
  if (error) throw error;
  return data.map(mapRow);
}

export async function createIdea({ title, note, link, deadline, status, tags }) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      title,
      note: note || "",
      link: link || "",
      deadline: deadline || null,
      status: status || "pending",
      tags: tags && tags.length ? tags : [],
    })
    .select()
    .single();
  if (error) throw error;
  return mapRow(data);
}

export async function updateIdea(id, patch) {
  const payload = {};
  if ("title" in patch) payload.title = patch.title;
  if ("note" in patch) payload.note = patch.note;
  if ("link" in patch) payload.link = patch.link;
  if ("deadline" in patch) payload.deadline = patch.deadline || null;
  if ("status" in patch) payload.status = patch.status;
  if ("tags" in patch) payload.tags = patch.tags;

  const { data, error } = await supabase
    .from(TABLE)
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return mapRow(data);
}

export async function deleteIdea(id) {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw error;
}
