import db from '$lib/server/db.js';

export async function load() {
  const todos = db.prepare('SELECT * FROM todos ORDER BY created_at DESC').all();
  return { todos };
}

export const actions = {
  create: async ({ request }) => {
    const formData = await request.formData();
    const title = formData.get('title')?.trim();

    if (!title) {
      return {
        success: false,
        error: 'Title cannot be empty'
      };
    }

    try {
      db.prepare('INSERT INTO todos (title, completed) VALUES (?, ?)').run(title, 0);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  toggle: async ({ request }) => {
    const formData = await request.formData();
    const id = parseInt(formData.get('id'));

    if (isNaN(id)) {
      return {
        success: false,
        error: 'Invalid ID'
      };
    }

    try {
      db.prepare(
        'UPDATE todos SET completed = CASE WHEN completed = 0 THEN 1 ELSE 0 END WHERE id = ?'
      ).run(id);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  delete: async ({ request }) => {
    const formData = await request.formData();
    const id = parseInt(formData.get('id'));

    if (isNaN(id)) {
      return {
        success: false,
        error: 'Invalid ID'
      };
    }

    try {
      db.prepare('DELETE FROM todos WHERE id = ?').run(id);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
};
