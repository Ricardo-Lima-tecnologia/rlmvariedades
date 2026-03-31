/**
 * db.js — Substituto do base44.entities
 * Usa Supabase como backend.
 *
 * Uso:
 *   import { db } from '@/lib/db';
 *   db.Product.list()
 *   db.Order.filter({ status: 'pending' })
 *   db.Product.create({ name: 'X', ... })
 *   db.Product.update(id, { price: 99 })
 *   db.Product.delete(id)
 */

import { supabase } from './supabaseClient';

function createEntityClient(table) {
  return {
    async list(orderBy = '-created_date', limit = 50) {
      const isDesc = orderBy.startsWith('-');
      const column = isDesc ? orderBy.slice(1) : orderBy;
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .order(column, { ascending: !isDesc })
        .limit(limit);
      if (error) throw error;
      return data;
    },

    async filter(filters = {}, orderBy = '-created_date', limit = 50) {
      const isDesc = orderBy.startsWith('-');
      const column = isDesc ? orderBy.slice(1) : orderBy;
      let query = supabase.from(table).select('*');
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
      const { data, error } = await query
        .order(column, { ascending: !isDesc })
        .limit(limit);
      if (error) throw error;
      return data;
    },

    async get(id) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },

    async create(payload) {
      const { data, error } = await supabase
        .from(table)
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async update(id, payload) {
      const { data, error } = await supabase
        .from(table)
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async delete(id) {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      return true;
    },

    subscribe(callback) {
      const channel = supabase
        .channel(`realtime:${table}`)
        .on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => {
          callback({
            type: payload.eventType,
            id: payload.new?.id || payload.old?.id,
            data: payload.new,
            old_data: payload.old,
          });
        })
        .subscribe();
      return () => supabase.removeChannel(channel);
    },
  };
}

export const db = {
  Product: createEntityClient('products'),
  Order: createEntityClient('orders'),
  Review: createEntityClient('reviews'),
  Coupon: createEntityClient('coupons'),
};