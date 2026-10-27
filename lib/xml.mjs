// A small XML tree for the CAT-tool files (XLIFF, TMX). Every tag keeps its original
// text, so writing a file back changes only the parts we edit, byte for byte.

import { decodeEntities } from './segment.mjs';

export class XmlProblem extends Error {
  constructor(message) { super(message); this.status = 400; }
}

const TOKEN = /<!--[\s\S]*?-->|<!\[CDATA\[([\s\S]*?)\]\]>|<\?[\s\S]*?\?>|<!DOCTYPE[^>]*>|<\/?[A-Za-z_][^>]*>|[^<]+/g;

/** Nodes: elements {name, open, close, attrs, children}, text {raw, text}, other markup {raw}. */
export function parseXml(xml) {
  const root = { name: '#root', open: '', close: '', attrs: {}, children: [] };
  const stack = [root];
  let covered = 0;
  for (const m of xml.matchAll(TOKEN)) {
    const raw = m[0];
    const top = stack[stack.length - 1];
    covered += raw.length;
    if (raw.startsWith('</')) {
      if (top.name !== raw.slice(2, -1).trim()) throw new XmlProblem(`This file isn't valid XML (unexpected ${raw}). Export it again from your translation tool.`);
      top.close = raw;
      stack.pop();
    } else if (/^<[A-Za-z_]/.test(raw)) {
      const el = { name: raw.match(/^<([^\s/>]+)/)[1], open: raw, close: '', attrs: parseAttrs(raw), children: [] };
      top.children.push(el);
      if (!raw.endsWith('/>')) stack.push(el);
    } else if (raw[0] !== '<') top.children.push({ raw, text: decodeEntities(raw) });
    else top.children.push(m[1] !== undefined ? { raw, text: m[1] } : { raw });
  }
  if (stack.length !== 1 || covered !== xml.length) throw new XmlProblem("This file isn't complete XML. Export it again from your translation tool.");
  return root;
}

export function parseAttrs(tag) {
  const out = {};
  for (const m of tag.matchAll(/([\w:.-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) out[m[1]] = decodeEntities(m[2] ?? m[3]);
  return out;
}

export const serialize = (n) => (n.name ? n.open + n.children.map(serialize).join('') + n.close : n.raw);

export const escapeXml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escapeAttr = (s) => escapeXml(s).replace(/"/g, '&quot;');

export const childrenNamed = (el, name) => el.children.filter((c) => c.name === name);
export const child = (el, name) => el.children.find((c) => c.name === name);

/** Every element named `name` below `el`, without looking inside a match. */
export function findAll(el, name, out = []) {
  for (const c of el.children) {
    if (!c.name) continue;
    if (c.name === name) out.push(c);
    else findAll(c, name, out);
  }
  return out;
}

export const textOf = (el) => el.children.map((c) => (c.name ? textOf(c) : c.text ?? '')).join('');

/** Sets an attribute on the element's opening tag, keeping everything else as written. */
export function setAttr(el, name, value) {
  const v = `${name}="${escapeAttr(value)}"`;
  const re = new RegExp(`(\\s)${name.replace(/[.:-]/g, '\\$&')}\\s*=\\s*(?:"[^"]*"|'[^']*')`);
  el.open = re.test(el.open) ? el.open.replace(re, (_, space) => space + v) : el.open.replace(/\s*(\/?>)$/, (_, end) => ` ${v}${end}`);
  el.attrs[name] = value;
}

/** Replaces the element's content; a self-closing tag becomes an open/close pair. */
export function setContent(el, raw) {
  if (el.open.endsWith('/>')) {
    el.open = el.open.replace(/\s*\/>$/, '>');
    el.close = `</${el.name}>`;
  }
  el.children = [{ raw }];
}
