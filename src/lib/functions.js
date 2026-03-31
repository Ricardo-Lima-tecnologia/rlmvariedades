/**
 * functions.js — Substituto do base44.functions.invoke
 * Chama Netlify Functions.
 *
 * Uso:
 *   import { invokeFn } from '@/lib/functions';
 *   invokeFn('createPayment', { orderId, ... })
 */

export async function invokeFn(functionName, payload = {}) {
  const res = await fetch(`/.netlify/functions/${functionName}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  return { data };
}