/**
 * service-worker.js — CNR PWA (Seguimiento + Ficha Visita Terreno)
 * Estrategia: Cache First para assets locales, pass-through para APIs
 * v3 — Rutas actualizadas a nueva estructura de carpetas
 */

'use strict';

const CACHE_NAME   = 'cnr-app-v3';
const OFFLINE_URLS = [
  // ── Ficha Seguimiento ──
  '/CNR/cnr-ficha_seguimiento/',
  '/CNR/cnr-ficha_seguimiento/index.html',
  '/CNR/cnr-ficha_seguimiento/css/styles.css',
  '/CNR/cnr-ficha_seguimiento/js/app.js',
  '/CNR/cnr-ficha_seguimiento/js/camera.js',
  '/CNR/cnr-ficha_seguimiento/manifest.json',
  '/CNR/cnr-ficha_seguimiento/icons/icon-192.png',
  '/CNR/cnr-ficha_seguimiento/icons/icon-512.png',

  // ── Ficha Visita Terreno ──
  '/CNR/cnr-ficha_visita/',
  '/CNR/cnr-ficha_visita/index.html',
  '/CNR/cnr-ficha_visita/styles_demanda.css',
  '/CNR/cnr-ficha_visita/app_demanda.js',
  '/CNR/cnr-ficha_visita/manifest_demanda.json',
];

/* ── Instalación ─────────────────────────────────────── */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(OFFLINE_URLS).catch(err => {
        con
