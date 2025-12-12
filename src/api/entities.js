// src/api/entities.js (أو نفس مسار الملف عندك)

import { supabase } from "./supabaseClient";

// دالة مساعدة للإدخال وإرجاع الصف الواحد
async function insertSingle(table, data) {
  const { data: rows, error } = await supabase
    .from(table)
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return rows;
}

/* -------------------- Exercise (تمارين القراءة) -------------------- */

export const Exercise = {
  // مستخدمة في CreateCustomExercisePage
  async create(payload) {
    // يتوقع وجود جدول اسمه exercises في Supabase
    return insertSingle("exercises", payload);
  },

  async getById(id) {
    const { data, error } = await supabase
      .from("exercises")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async list() {
    const { data, error } = await supabase
      .from("exercises")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },
};

/* -------------------- Recording (تسجيلات الصوت) -------------------- */

export const Recording = {
  async create(payload) {
    // يتوقع وجود جدول recordings (أنشأناه سابقاً)
    return insertSingle("recordings", payload);
  },

  async listByExercise({ exercise_id, student_id }) {
    let query = supabase
      .from("recordings")
      .select("*")
      .eq("exercise_id", exercise_id)
      .order("created_at", { ascending: false });

    if (student_id) {
      query = query.eq("student_id", student_id);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase.from("recordings").delete().eq("id", id);
    if (error) throw error;
  },

  async deleteAllForExercise({ exercise_id, student_id }) {
    let query = supabase.from("recordings").delete().eq("exercise_id", exercise_id);

    if (student_id) {
      query = query.eq("student_id", student_id);
    }

    const { error } = await query;
    if (error) throw error;
  },
};

/* -------------------- باقي الكيانات (مبدئياً Stubs) -------------------- */
/* سنكمّلها عندما ترسل الصفحات التي تستخدمها */

export const Student = {};
export const Lesson = {};
export const StudentQuestion = {};
export const StudentGroup = {};
export const SystemSetting = {};
export const FamilyChallenge = {};
export const ClassAnnouncement = {};
export const Certificate = {};

/* -------------------- Auth عبر Supabase -------------------- */

export const User = {
  async getUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
};
