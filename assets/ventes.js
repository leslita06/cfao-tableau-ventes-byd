(function () {
  'use strict';
  var D = window.D, AUJ = D.AUJ;
  var VEND = {}; D.VENDEURS.forEach(function (v) { VEND[v.id] = v; });
  var PRIX = {}; D.MODELES.forEach(function (m) { PRIX[m.nom] = m.prix; });
  var SITES = []; D.VENDEURS.forEach(function (v) { if (SITES.indexOf(v.site) < 0) SITES.push(v.site); });
  var MOIS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  var MOISL = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  var JOURS = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
  var JOURSL = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  var COUL_MOTIF = { 'Prix': '#00438D', 'Financement refusé': '#2F6DB5', 'Délai de livraison': '#B54708', 'Concurrent': '#B42318', 'Sans réponse': '#A3A8B5' };

  // ---------- outils ----------
  function dte(s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function ecart(a, b) { return Math.round((dte(b) - dte(a)) / 864e5); }
  function plus(s, n) { var d = dte(s); d.setDate(d.getDate() + n); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function jm(s) { var d = dte(s); return d.getDate() + (d.getDate() === 1 ? 'er' : '') + ' ' + MOIS[d.getMonth()]; }
  function jjm(s) { var d = dte(s); return JOURS[d.getDay()] + ' ' + jm(s); }
  function fmt(n) { return Math.round(n).toLocaleString('fr-FR'); }
  function pct(x) { return isFinite(x) ? Math.round(x * 100) + ' %' : 'n.d.'; }
  function dec(x, k) { return x.toLocaleString('fr-FR', { minimumFractionDigits: k, maximumFractionDigits: k }); }
  function mf(v) { return v >= 1e9 ? dec(v / 1e9, 2) + ' Md' : dec(v / 1e6, v >= 1e8 ? 0 : 1) + ' M'; }
  function ini(n) { return n.split(' ').map(function (x) { return x[0]; }).join('').slice(0, 2).toUpperCase(); }
  function prenom(id) { return VEND[id].nom.split(' ')[0]; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function $(id) { return document.getElementById(id); }

  var SV = function (p) { return '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>'; };
  var ICO = {
    soleil: SV('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
    devis: SV('<path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>'),
    perdu: SV('<circle cx="9" cy="8" r="4"/><path d="M2 21v-1a6 6 0 016-6h2M16 15l5 5M21 15l-5 5"/>'),
    relance: SV('<path d="M21 12a9 9 0 11-3-6.7L21 8"/><path d="M21 3v5h-5"/>'),
    ab: SV('<path d="M3 20V10M10 20V4M17 20v-7"/><path d="M21 20H2"/>'),
    envoi: SV('<path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/>'),
    oeil: SV('<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/>'),
    rep: SV('<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>'),
    cal: SV('<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>'),
    ok: SV('<path d="M20 6L9 17l-5-5"/>'),
    croix: SV('<path d="M18 6L6 18M6 6l12 12"/>'),
    wa: SV('<path d="M3 21l1.7-5A8.5 8.5 0 1112 20.5a8.4 8.4 0 01-4-1z"/>'),
    mail: SV('<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6l-10 7L2 6"/>'),
    tel: SV('<path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.4 1.8.7 2.7a2 2 0 01-.5 2.1L8 9.8a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.4c.9.3 1.8.6 2.7.7a2 2 0 011.7 2z"/>'),
    flamme: SV('<path d="M12 22c4.4 0 7-3 7-7 0-5-5-7-5-12-3 2-4 5-4 7-1-1-2-2-2-4-2 2-3 5-3 8 0 4 3 8 7 8z"/>'),
    argent: SV('<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 12h.01M18 12h.01"/>'),
    horloge: SV('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    retour: SV('<path d="M9 14L4 9l5-5"/><path d="M4 9h11a5 5 0 010 10h-3"/>'),
    video: SV('<rect x="2" y="5" width="15" height="14" rx="2"/><path d="M17 10l5-3v10l-5-3z"/>'),
    cat: SV('<path d="M4 4h6a3 3 0 013 3v13a2 2 0 00-2-2H4zM20 4h-6a3 3 0 00-3 3v13a2 2 0 012-2h7z"/>'),
    photo: SV('<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>'),
    trophee: SV('<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 01-10 0zM17 5h3v2a3 3 0 01-3 3M7 5H4v2a3 3 0 003 3"/>'),
    attente: SV('<circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/>'),
    voiture: SV('<path d="M5 17h-2v-6l2-5h10l3 5h3v6h-2"/><circle cx="7.5" cy="17.5" r="2"/><circle cx="16.5" cy="17.5" r="2"/>')
  };
  var ICO_CONT = { 'Vidéo': 'video', 'Catalogue': 'cat', 'Photo': 'photo' };
  var CL_CONT = { 'Vidéo': '', 'Catalogue': 'cat', 'Photo': 'ph' };

  // ---------- état ----------
  var E = { per: 3, modele: '', site: '', vendeur: '', canal: '', onglet: 'jour', motif: '', triRq: 'tous', triRel: 'tous', sel: null, plusRq: false, valides: {} };
  var debutPer = function () { return { 1: '2026-11-01', 3: '2026-09-01', 6: '2026-06-01' }[E.per]; };
  function okDims(r) {
    return (!E.modele || r.modele === E.modele) && (!E.site || VEND[r.vendeur].site === E.site) && (!E.vendeur || r.vendeur === E.vendeur) && (!E.canal || r.canal === E.canal);
  }
  function okPer(s) { return s >= debutPer() && s <= AUJ; }
  function devisPer() { return D.devis.filter(function (r) { return okDims(r) && okPer(r.date); }); }
  function enCours() { return D.devis.filter(function (r) { return okDims(r) && r.statut === 'En cours'; }); }
  function statutRel(x, r) {
    if (x.statut === 'À valider' && E.valides[r.n + x.j]) return 'Validé';
    return x.statut;
  }

  // ---------- filtres ----------
  function construireFiltres() {
    var h = '<button class="chip on" data-v="">Tous</button>';
    D.MODELES.forEach(function (m) { h += '<button class="chip" data-v="' + m.nom + '">' + m.nom + '</button>'; });
    $('f-modele').innerHTML = h;
    $('f-site').innerHTML = '<option value="">Tous les sites</option>' + SITES.map(function (s) { return '<option>' + s + '</option>'; }).join('');
    $('f-canal').innerHTML = '<option value="">Tous les canaux</option>' + D.CANAUX.map(function (s) { return '<option>' + s + '</option>'; }).join('');
    majVendeurs();
    $('f-periode').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; E.per = +b.dataset.v; tout(); });
    $('f-modele').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; E.modele = b.dataset.v; tout(); });
    $('f-site').addEventListener('change', function () { E.site = this.value; if (E.vendeur && VEND[E.vendeur].site !== E.site && E.site) E.vendeur = ''; majVendeurs(); tout(); });
    $('f-vendeur').addEventListener('change', function () { E.vendeur = this.value; tout(); });
    $('f-canal').addEventListener('change', function () { E.canal = this.value; tout(); });
    $('raz').addEventListener('click', function () { E.per = 3; E.modele = E.site = E.vendeur = E.canal = E.motif = ''; E.triRq = E.triRel = 'tous'; majVendeurs(); tout(); });
  }
  function majVendeurs() {
    $('f-vendeur').innerHTML = '<option value="">Toute l\'équipe</option>' + D.VENDEURS.filter(function (v) { return !E.site || v.site === E.site; })
      .map(function (v) { return '<option value="' + v.id + '">' + v.nom + '</option>'; }).join('');
    $('f-vendeur').value = E.vendeur;
  }
  function etatFiltres() {
    [].forEach.call($('f-periode').children, function (b) { b.classList.toggle('on', +b.dataset.v === E.per); });
    [].forEach.call($('f-modele').children, function (b) { b.classList.toggle('on', b.dataset.v === E.modele); });
    $('f-site').value = E.site; $('f-vendeur').value = E.vendeur; $('f-canal').value = E.canal;
    var per = { 1: 'novembre, du 1er au 24', 3: 'du 1er septembre au 24 novembre', 6: 'du 1er juin au 24 novembre' }[E.per];
    var qui = E.vendeur ? VEND[E.vendeur].nom : (E.site ? 'site ' + E.site : 'toute l\'équipe BYD');
    var t = '<b>' + per.charAt(0).toUpperCase() + per.slice(1) + '</b>, ' + qui + (E.modele ? ', ' + E.modele : ', toute la gamme') + (E.canal ? ', devis par ' + E.canal : '');
    if (E.onglet === 'ab') t = '<b>Depuis le début du test, le 15 avril</b>, ' + qui + (E.modele ? ', ' + E.modele : ', toute la gamme') + (E.canal ? ', devis par ' + E.canal : '') + ' (toutes les relances comptent, quelle que soit la période choisie)';
    if (E.onglet === 'jour') t = '<b>Aujourd\'hui, ' + JOURSL[dte(AUJ).getDay()] + ' ' + jm(AUJ) + '</b>, ' + qui + (E.modele ? ', ' + E.modele : '') + ' (la période ne s\'applique pas au rapport du jour)';
    $('lecture').innerHTML = t;
    $('f-periode').style.opacity = (E.onglet === 'jour' || E.onglet === 'ab') ? .45 : 1;
  }

  // ---------- onglets ----------
  function onglets() {
    [].forEach.call(document.querySelectorAll('.tab-ico'), function (s) { s.outerHTML = ICO[s.dataset.i]; });
    $('onglets').addEventListener('click', function (e) { var b = e.target.closest('.tab'); if (!b) return; aller(b.dataset.t); });
  }
  function aller(t, haut) {
    E.onglet = t;
    [].forEach.call(document.querySelectorAll('.tab'), function (b) { b.classList.toggle('on', b.dataset.t === t); });
    [].forEach.call(document.querySelectorAll('.panneau'), function (p) { p.classList.toggle('on', p.id === 'p-' + t); });
    tout();
    if (haut !== false) window.scrollTo({ top: 0 });
  }
  function kpi(cls, ico, lib, val, ref) {
    return '<div class="kpi ' + (cls || '') + '"><div class="k-lib">' + ICO[ico] + lib + '</div><div class="k-val">' + val + '</div><div class="k-ref">' + ref + '</div></div>';
  }
  function badge(c, t) { return '<span class="badge b-' + c + '">' + t + '</span>'; }

  // ---------- score du jour ----------
  function chaleur(r) {
    var s = 10, age = ecart(r.date, AUJ);
    if (r.ouvert) s += 15;
    if (r.reponse) s += 30;
    if (r.rdv) s += r.rdv >= AUJ ? 25 : (ecart(r.rdv, AUJ) <= 4 ? 18 : 4);
    if (r.valeur >= 40e6) s += 10;
    if (r.type === 'Entreprise') s += 8;
    if (age <= 3) s += 6;
    if (!r.reponse && age > 10) s -= 12;
    return Math.max(5, Math.min(97, s));
  }
  function niveau(s) { return s >= 70 ? 'chaud' : (s >= 45 ? 'tiede' : 'froid'); }
  function pourquoi(r) {
    var age = ecart(r.date, AUJ);
    if (r.rdv && r.rdv > AUJ) return { t: 'Essai prévu ' + jjm(r.rdv), a: 'Confirmer l\'heure et préparer le véhicule' };
    if (r.rdv && r.rdv === AUJ) return { t: 'Essai aujourd\'hui', a: 'Appeler ce matin pour confirmer' };
    if (r.rdv) return { t: 'Essai fait le ' + jm(r.rdv) + ', pas encore de décision', a: 'Rappeler pour la commande et le financement' };
    if (r.reponse) return { t: 'A répondu le ' + jm(r.reponse) + ', pas de rendez-vous', a: 'Proposer deux créneaux d\'essai' };
    if (r.ouvert && age === 0) return { t: 'Devis envoyé et ouvert ce matin', a: 'Appeler en fin de journée pour répondre aux questions' };
    if (r.ouvert) return { t: 'Devis ouvert le ' + jm(r.ouvert) + ', sans réponse depuis ' + age + ' j', a: age >= 7 ? 'Appeler, la relance e-mail est partie' : 'Appeler avant la relance WhatsApp' };
    return { t: 'Devis pas encore ouvert (' + age + ' j)', a: 'Vérifier le numéro et renvoyer par WhatsApp' };
  }

  // ---------- RAPPORT DU JOUR ----------
  function rendreJour() {
    var ec = enCours().map(function (r) { return { r: r, s: chaleur(r) }; }).sort(function (a, b) { return b.s - a.s || b.r.valeur - a.r.valeur; });
    var ar = ec.filter(function (x) { return x.s >= 45; });
    var val = ar.reduce(function (a, x) { return a + x.r.valeur; }, 0);
    var fin = plus(AUJ, 6);
    var essais = ec.filter(function (x) { return x.r.rdv && x.r.rdv >= AUJ && x.r.rdv <= fin; }).length;
    var aval = relancesAValider();
    var pr = perdusARappeler();
    var h = kpi('rouge', 'flamme', 'À rappeler aujourd\'hui', fmt(ar.length), ar.filter(function (x) { return x.s >= 70; }).length + ' chauds, ' + ar.filter(function (x) { return x.s < 70; }).length + ' tièdes');
    h += kpi('', 'argent', 'Valeur en jeu', mf(val) + ' <small>FCFA</small>', 'devis en cours de ces clients');
    h += kpi('vert', 'cal', 'Essais cette semaine', fmt(essais), 'du ' + jm(AUJ) + ' au ' + jm(fin));
    h += kpi('orange', 'relance', 'Relances à valider', fmt(aval.length), 'prêtes, rien n\'est parti');
    $('k-jour').innerHTML = h;
    $('t-jour').textContent = 'À rappeler aujourd\'hui, ' + JOURSL[dte(AUJ).getDay()] + ' ' + jm(AUJ);
    if (!ar.length) { $('liste-jour').innerHTML = '<div class="vide">Aucun prospect chaud avec ces filtres.</div>'; }
    else $('liste-jour').innerHTML = ar.map(function (x) {
      var r = x.r, p = pourquoi(r), nv = niveau(x.s);
      return '<div class="pros"><div class="score ' + nv + '" title="Score sur 100">' + x.s + '</div>' +
        '<div><div class="p-nom">' + esc(r.client) + '</div><div class="p-sub">' + (r.entreprise ? esc(r.entreprise) + ', ' : '') + VEND[r.vendeur].nom + ', ' + VEND[r.vendeur].site + '</div></div>' +
        '<div class="p-mod"><b>' + (r.qte > 1 ? r.qte + ' ' : '') + r.modele + '</b><div class="p-sub">' + mf(r.valeur) + ' FCFA, devis du ' + jm(r.date) + '</div></div>' +
        '<div class="p-pq"><b>' + p.t + '</b><div class="p-sub">' + p.a + '</div></div>' +
        '<div class="p-act">' + badge(nv === 'chaud' ? 'rouge' : (nv === 'tiede' ? 'orange' : 'gris'), nv === 'chaud' ? 'Chaud' : (nv === 'tiede' ? 'Tiède' : 'Froid')) +
        '<button class="btn" data-frise="' + r.n + '">' + ICO.relance + 'Voir la frise</button></div></div>';
    }).join('') + (ec.length > ar.length ? '<p class="note" style="margin:10px 0 0">' + (ec.length - ar.length) + ' autre' + (ec.length - ar.length > 1 ? 's' : '') + ' devis en cours, plus froid' + (ec.length - ar.length > 1 ? 's' : '') + ', suivi' + (ec.length - ar.length > 1 ? 's' : '') + ' par les relances automatiques.</p>' : '');
    $('jour-perdus').innerHTML = pr.length ? pr.slice(0, 5).map(function (r) {
      return '<div class="mini"><div class="av">' + ini(r.client) + '</div><div class="txt"><b>' + esc(r.client) + '</b><span>Perdu le ' + jm(r.fin) + ' : ' + r.motif.toLowerCase() + ', ' + r.modele + '</span></div><div class="fleche">' + r.reconq.modele + ' →</div></div>';
    }).join('') + '<button class="plus" data-aller="perdus">Voir les ' + pr.length + ' clients à reconquérir</button>' : '<div class="vide">Aucun client perdu à rappeler avec ces filtres.</div>';
    $('jour-valider').innerHTML = aval.length ? aval.map(function (o) {
      return '<div class="mini"><div class="av orange">' + (o.x.canal === 'WhatsApp' ? 'WA' : '@') + '</div><div class="txt"><b>' + esc(o.r.client) + '</b><span>Relance à ' + o.x.j + ' jours par ' + (o.x.canal === 'E-mail' ? 'e-mail' : o.x.canal) + ', ' + o.r.modele + ', ' + prenom(o.r.vendeur) + '</span></div><button class="btn" data-frise="' + o.r.n + '">Relire</button></div>';
    }).join('') : '<div class="vide">Toutes les relances du jour sont validées.</div>';
  }
  function relancesAValider() {
    var out = [];
    enCours().forEach(function (r) { r.relances.forEach(function (x) { if (statutRel(x, r) === 'À valider') out.push({ r: r, x: x }); }); });
    return out;
  }
  function perdusARappeler() {
    return D.devis.filter(function (r) { return okDims(r) && r.reconq && (r.reconq.statut === 'À relancer' || r.reconq.statut === 'En discussion') && ecart(r.fin, AUJ) <= 75; })
      .sort(function (a, b) { return (a.reconq.statut === 'À relancer' ? 0 : 1) - (b.reconq.statut === 'À relancer' ? 0 : 1) || b.valeur - a.valeur; });
  }

  // ---------- DEVIS ----------
  function stats(L) {
    var s = { n: L.length, ouv: 0, rep: 0, rdv: 0, sig: 0, per: 0, val: 0, vsig: 0, drep: 0, henv: 0 };
    L.forEach(function (r) {
      s.val += r.valeur; s.henv += r.h_envoi;
      if (r.ouvert) s.ouv++;
      if (r.reponse) { s.rep++; s.drep += ecart(r.date, r.reponse); }
      if (r.rdv && r.rdv <= AUJ) s.rdv++;
      if (r.statut === 'Signé') { s.sig++; s.vsig += r.valeur; }
      if (r.statut === 'Perdu') s.per++;
    });
    return s;
  }
  function rendreDevis() {
    var L = devisPer(), s = stats(L);
    var h = kpi('', 'envoi', 'Devis envoyés', fmt(s.n), mf(s.val) + ' FCFA au catalogue');
    h += kpi('', 'oeil', 'Ouverts', pct(s.ouv / s.n), fmt(s.ouv) + ' devis lus par le client');
    h += kpi('', 'rep', 'Répondus', pct(s.rep / s.n), 'réponse en <b>' + (s.rep ? dec(s.drep / s.rep, 1) : 'n.d.') + ' j</b> en moyenne');
    h += kpi('vert', 'ok', 'Signés', fmt(s.sig), '<span class="badge b-vert">' + pct(s.sig / s.n) + '</span> des devis, ' + mf(s.vsig) + ' FCFA');
    h += kpi('rouge', 'croix', 'Perdus', fmt(s.per), fmt(s.n - s.sig - s.per) + ' encore en cours');
    $('k-devis').innerHTML = h;
    // alertes
    var al = enCours().filter(function (r) { return !r.reponse && ecart(r.date, AUJ) >= 3; }).sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    $('n-alertes').textContent = al.length ? al.length + ' devis, ' + mf(al.reduce(function (a, r) { return a + r.valeur; }, 0)) + ' FCFA' : '';
    $('alertes-devis').innerHTML = al.length ? '<div class="al-grille">' + al.map(function (r) {
      var age = ecart(r.date, AUJ), last = r.relances.length ? r.relances[r.relances.length - 1] : null;
      var etat = last ? 'Relance à ' + last.j + ' j : ' + statutRel(last, r).toLowerCase() : (r.ouvert ? 'Ouvert, pas encore relancé' : 'Pas encore ouvert');
      return '<div class="al-d ' + (age >= 7 ? 'rouge' : '') + '"><div class="h"><b>' + esc(r.client) + '</b>' + badge(age >= 7 ? 'rouge' : 'orange', age + ' jours') + '</div>' +
        '<div class="s">' + (r.qte > 1 ? r.qte + ' ' : '') + r.modele + ', ' + mf(r.valeur) + ' FCFA, ' + VEND[r.vendeur].nom + '<br>' + etat + '</div>' +
        '<button class="btn" data-frise="' + r.n + '">' + ICO.relance + 'Voir la frise</button></div>';
    }).join('') + '</div>' : '<div class="vide">Aucun devis en attente depuis 3 jours avec ces filtres.</div>';
    // entonnoir
    var et = [['Envoyés', s.n, ''], ['Ouverts', s.ouv, 'ouv'], ['Répondus', s.rep, 'rep'], ['Essai ou visite', s.rdv, 'rdv'], ['Signés', s.sig, 'sig']];
    $('entonnoir').innerHTML = et.map(function (e, i) {
      var w = s.n ? Math.max(4, 100 * e[1] / s.n) : 0;
      var p = i === 0 ? 'base 100 %' : pct(e[1] / s.n) + ' des envoyés';
      return '<div class="ent-l"><span>' + e[0] + '</span><div><div class="ent-b ' + e[2] + '" style="width:' + w + '%">' + fmt(e[1]) + '</div></div><span class="ent-p">' + p + '</span></div>';
    }).join('');
    // par modèle / canal
    function barres(cle, liste, el, clic) {
      var rows = liste.map(function (k) { var sl = L.filter(function (r) { return r[cle] === k; }); return { k: k, s: stats(sl) }; }).filter(function (x) { return x.s.n; })
        .sort(function (a, b) { return b.s.sig / b.s.n - a.s.sig / a.s.n; });
      var mx = Math.max.apply(null, rows.map(function (x) { return x.s.rep / x.s.n; }).concat([.01]));
      $(el).innerHTML = rows.length ? rows.map(function (x) {
        var sel = (cle === 'modele' && E.modele === x.k) || (cle === 'canal' && E.canal === x.k);
        return '<div class="db clic' + (sel ? ' sel' : '') + '" data-' + cle + '="' + x.k + '"><div class="db-n">' + x.k + '<small>' + x.s.n + ' devis</small></div><div class="db-b"><div><i class="r" style="width:' + (100 * x.s.rep / x.s.n / mx) + '%"></i></div><div><i class="s" style="width:' + (100 * x.s.sig / x.s.n / mx) + '%"></i></div></div><div class="db-v">' + pct(x.s.rep / x.s.n) + '<br><b>' + pct(x.s.sig / x.s.n) + '</b></div></div>';
      }).join('') : '<div class="vide">Aucun devis.</div>';
    }
    barres('modele', D.MODELES.map(function (m) { return m.nom; }), 'par-modele');
    barres('canal', D.CANAUX, 'par-canal');
    // vendeurs
    var vs = D.VENDEURS.filter(function (v) { return !E.site || v.site === E.site; }).map(function (v) {
      var sl = L.filter(function (r) { return r.vendeur === v.id; }); return { v: v, s: stats(sl) };
    });
    $('par-vendeur').innerHTML = '<div class="vd tete"><div>Conseiller</div><div>Devis</div><div>Réponse</div><div>Signés</div><div>Envoi du devis</div><div>Valeur signée</div></div>' + vs.map(function (x) {
      var s = x.s, n = s.n || 1;
      return '<div class="vd' + (E.vendeur === x.v.id ? ' sel' : '') + '" data-vend="' + x.v.id + '"><div class="n"><b>' + x.v.nom + '</b><small>' + x.v.site + '</small></div><div>' + s.n + '</div><div>' + pct(s.rep / n) + '</div><div>' + s.sig + ' ' + badge(s.sig / n >= .3 ? 'vert' : (s.sig / n >= .2 ? 'gris' : 'rouge'), pct(s.sig / n)) + '</div><div>' + (s.n ? dec(s.henv / n, 0) + ' h' : 'n.d.') + '</div><div>' + mf(s.vsig) + '</div></div>';
    }).join('');
  }

  // ---------- CLIENTS PERDUS ----------
  var chPerte = null, chAb = null;
  function moisStats(y, m) {
    var deb = y + '-' + ('0' + m).slice(-2) + '-01', fin = plus(m === 12 ? (y + 1) + '-01-01' : y + '-' + ('0' + (m + 1)).slice(-2) + '-01', -1);
    var L = D.devis.filter(function (r) { return okDims(r) && r.fin && r.fin >= deb && r.fin <= fin; });
    var p = L.filter(function (r) { return r.statut === 'Perdu'; }), s = L.filter(function (r) { return r.statut === 'Signé'; });
    return { p: p.length, s: s.length, t: p.length / Math.max(1, p.length + s.length), v: p.reduce(function (a, r) { return a + r.valeur; }, 0) };
  }
  function rendrePerdus() {
    var nov = moisStats(2026, 11), oct = moisStats(2026, 10);
    var perdusP = D.devis.filter(function (r) { return okDims(r) && r.statut === 'Perdu' && okPer(r.fin); });
    var cnt = {}; perdusP.forEach(function (r) { cnt[r.motif] = (cnt[r.motif] || 0) + 1; });
    var top = Object.keys(cnt).filter(function (k) { return k !== 'Sans réponse'; }).sort(function (a, b) { return cnt[b] - cnt[a]; })[0];
    var rel = perdusP.filter(function (r) { return r.reconq && r.reconq.statut !== 'À relancer'; });
    var rec = rel.filter(function (r) { return r.reconq.statut === 'Reconquis'; });
    var d = Math.round((nov.t - oct.t) * 100);
    var h = kpi(d <= 0 ? 'vert' : 'rouge', 'perdu', 'Taux de perte, novembre', pct(nov.t), badge(d <= 0 ? 'vert' : 'rouge', (d > 0 ? '+' : '') + d + ' pts') + ' contre octobre (' + pct(oct.t) + ')');
    h += kpi('rouge', 'argent', 'Valeur perdue, novembre', mf(nov.v) + ' <small>FCFA</small>', nov.p + ' devis perdus au 24');
    h += kpi('orange', 'attente', 'Premier motif', top ? (top === 'Financement refusé' ? 'Financement' : top) : 'n.d.', top ? cnt[top] + ' pertes sur la période, hors silence' : '');
    h += kpi('vert', 'retour', 'Taux de reconquête', pct(rec.length / Math.max(1, rel.length)), rec.length + ' reconquis sur ' + rel.length + ' relancés');
    h += kpi('', 'tel', 'À reconquérir', fmt(perdusARappeler().length), 'à relancer ou en discussion');
    $('k-perdus').innerHTML = h;
    // courbe
    var lab = [], tx = [], nb = [];
    [6, 7, 8, 9, 10, 11].forEach(function (m) { var s = moisStats(2026, m); lab.push(MOIS[m - 1] + (m === 11 ? ' (au 24)' : '')); tx.push(Math.round(s.t * 100)); nb.push(s.p); });
    if (chPerte) chPerte.destroy();
    chPerte = new Chart($('c-perte'), {
      data: { labels: lab, datasets: [
        { type: 'line', label: 'Taux de perte', data: tx, borderColor: '#B42318', backgroundColor: '#B42318', yAxisID: 'y', tension: .3, pointRadius: 4, borderWidth: 2.5 },
        { type: 'bar', label: 'Devis perdus', data: nb, backgroundColor: '#E6EAF0', borderRadius: 6, yAxisID: 'y1', maxBarThickness: 38 }] },
      options: { maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
        plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { family: 'Inter', size: 12 } } },
          tooltip: { callbacks: { label: function (c) { return c.dataset.label + ' : ' + c.parsed.y + (c.datasetIndex === 0 ? ' %' : ''); } } } },
        scales: { y: { min: 0, max: 100, ticks: { callback: function (v) { return v + ' %'; }, font: { size: 11 } }, grid: { color: '#EEF1F5' } },
          y1: { position: 'right', beginAtZero: true, grid: { display: false }, ticks: { font: { size: 11 } } }, x: { grid: { display: false }, ticks: { font: { size: 11 } } } } }
    });
    // motifs
    var tot = perdusP.length;
    $('n-motifs').textContent = tot + ' devis perdus sur la période';
    var mot = D.MOTIFS.slice().sort(function (a, b) { return (cnt[b] || 0) - (cnt[a] || 0); });
    var mx = Math.max.apply(null, mot.map(function (k) { return cnt[k] || 0; }).concat([1]));
    $('motifs').innerHTML = mot.map(function (k) {
      var n = cnt[k] || 0, v = perdusP.filter(function (r) { return r.motif === k; }).reduce(function (a, r) { return a + r.valeur; }, 0);
      return '<div class="mo' + (E.motif && E.motif !== k ? ' off' : '') + '" data-motif="' + k + '"><div class="lb"><i style="background:' + COUL_MOTIF[k] + '"></i>' + k + '</div><div class="t"><i style="width:' + (100 * n / mx) + '%;background:' + COUL_MOTIF[k] + '"></i></div><div class="v"><b>' + n + '</b> (' + pct(n / Math.max(1, tot)) + ')<br>' + mf(v) + ' FCFA</div></div>';
    }).join('') + '<p class="note" style="margin:10px 0 0">Cliquer un motif filtre la liste des clients à reconquérir.</p>';
    // liste
    var tris = [['tous', 'Tous'], ['À relancer', 'À relancer'], ['En discussion', 'En discussion'], ['Reconquis', 'Reconquis']];
    $('tri-reconq').innerHTML = tris.map(function (t) { return '<button class="chip' + (E.triRq === t[0] ? ' on' : '') + '" data-trirq="' + t[0] + '">' + t[1] + '</button>'; }).join('') + (E.motif ? '<button class="chip on" data-motif="' + E.motif + '">' + E.motif + ' ×</button>' : '');
    var ordre = { 'À relancer': 0, 'En discussion': 1, 'Relancé': 2, 'Reconquis': 3, 'Relancé, sans suite': 4 };
    var L = perdusP.filter(function (r) { return r.reconq && (E.triRq === 'tous' || r.reconq.statut === E.triRq) && (!E.motif || r.motif === E.motif); })
      .sort(function (a, b) { return ordre[a.reconq.statut] - ordre[b.reconq.statut] || b.valeur - a.valeur; });
    var n = E.plusRq ? L.length : 8;
    var cls = { 'À relancer': 'orange', 'En discussion': 'gris', 'Relancé': 'gris', 'Reconquis': 'vert', 'Relancé, sans suite': 'rouge' };
    $('liste-reconq').innerHTML = L.length ? L.slice(0, n).map(function (r) {
      return '<div class="rq"><div class="n"><b>' + esc(r.client) + '</b><small>' + (r.entreprise ? esc(r.entreprise) + ', ' : '') + VEND[r.vendeur].nom + '</small></div>' +
        '<div class="rq-av"><b>' + (r.qte > 1 ? r.qte + ' ' : '') + r.modele + '</b><small>Perdu le ' + jm(r.fin) + ' : ' + r.motif.toLowerCase() + (r.concurrent ? ' (' + r.concurrent + ')' : '') + '</small></div>' +
        '<div class="fl">→</div><div class="rq-ap"><b>Proposer : ' + r.reconq.modele + (r.motif === 'Financement refusé' ? ' en location LOXEA' : '') + '</b><small>' + r.reconq.raison + '</small></div>' +
        '<div class="st">' + badge(cls[r.reconq.statut], r.reconq.statut) + '</div></div>';
    }).join('') + (L.length > 8 ? '<button class="plus" id="plus-rq">' + (E.plusRq ? 'Réduire la liste' : 'Voir les ' + L.length + ' clients') + '</button>' : '') : '<div class="vide">Aucun client avec ces filtres.</div>';
  }

  // ---------- RELANCES ----------
  function msgs(r) {
    var v = VEND[r.vendeur], pv = prenom(r.vendeur), civ = r.client.split(' ')[0];
    var lieu = v.site === 'LOXEA aéroport' ? 'au showroom LOXEA de l\'aéroport' : 'à notre showroom de ' + v.site;
    var cont = r.contenu || 'Vidéo';
    var piece = { 'Vidéo': 'la vidéo de 45 secondes de ' + (r.modele === 'Seal' || r.modele === 'Atto 3' || r.modele === 'Song Plus DM-i' ? 'la ' : 'la ') + r.modele + ' sur la route', 'Catalogue': 'le catalogue de la ' + r.modele + ' avec les versions et les équipements', 'Photo': 'trois photos de la ' + r.modele + ' disponible chez nous' }[cont];
    var flotte = r.qte > 1;
    return {
      devis: 'Bonjour ' + civ + ', voici votre devis pour ' + (flotte ? r.qte + ' ' + r.modele : 'la BYD ' + r.modele) + ' : ' + fmt(r.valeur) + ' FCFA TTC, valable 30 jours. ' + pv + ', CFAO Mobility',
      j3: 'Bonjour ' + civ + ', c\'est ' + pv + ' de BYD CFAO Mobility. Je vous envoie ' + piece + '. ' + (flotte ? 'Voulez-vous qu\'on vous présente l\'offre de flotte cette semaine ?' : 'Un essai ' + lieu + ' cette semaine, mercredi ou samedi ?'),
      j7o: (flotte ? 'Vos ' + r.qte + ' ' + r.modele + ' : la proposition et l\'essai' : 'Votre BYD ' + r.modele + ' : un essai et le financement'),
      j7: 'Bonjour ' + civ + ',\n\nVous avez reçu notre devis pour ' + (flotte ? r.qte + ' ' + r.modele : 'la BYD ' + r.modele) + ' le ' + jm(r.date) + '. ' + (flotte ? 'Nous pouvons aussi vous proposer la location longue durée LOXEA sur 36 mois, entretien compris.' : 'Si le financement vous fait hésiter, nos banques partenaires et la location longue durée LOXEA permettent de démarrer sans gros apport.') + '\n\nJe vous propose un essai de 30 minutes ' + lieu + '. Quel jour vous arrange ?\n\nBien cordialement,\n' + v.nom + '\nConseiller BYD, CFAO Mobility Côte d\'Ivoire',
      rep: r.rdv ? (flotte ? 'Bonjour, merci. Notre direction veut voir le véhicule. Pouvons-nous passer ' + jjm(r.rdv) + ' ?' : 'Bonjour ' + pv + ', merci. Je peux passer pour l\'essai ' + jjm(r.rdv) + ' ?') :
        ({ 'Prix': 'Merci. C\'est au-dessus de mon budget pour le moment.', 'Financement refusé': 'Bonjour, ma banque n\'a pas donné suite pour le crédit.', 'Délai de livraison': 'Merci, mais le délai de livraison est trop long pour moi.', 'Concurrent': 'Merci, j\'ai finalement pris une autre offre.' }[r.motif] || 'Bien reçu, merci. Je reviens vers vous après en avoir parlé en famille.')
    };
  }
  function tique(st) { return st === 'Parti' ? '<span class="nv">✓✓</span>' : '<span class="vu">✓✓</span>'; }
  function vign(c) { return '<div class="vign ' + CL_CONT[c] + '">' + ICO[ICO_CONT[c]] + '</div>'; }
  function frise(r) {
    var m = msgs(r), et = [], fin = r.fin;
    var heure = function (i) { return ['8 h 42', '9 h 15', '10 h 03', '11 h 20', '14 h 36', '16 h 10'][(r.n.charCodeAt(7) + i) % 6]; };
    et.push({ c: 'fait', i: 'envoi', t: 'Devis envoyé par ' + (r.canal === 'E-mail' || r.canal === 'Site' ? 'e-mail' : 'WhatsApp'), d: jjm(r.date) + (r.canal === 'Showroom' ? ', après la visite au showroom' : (r.canal === 'Site' ? ', demande reçue par le site' : '')),
      h: (r.canal === 'E-mail' || r.canal === 'Site') ? mail(VEND[r.vendeur].nom, r.client, 'Votre devis BYD ' + r.modele, m.devis, r.ouvert ? 'Ouvert le ' + jm(r.ouvert) : 'Pas encore ouvert') : wa([{ t: m.devis, h: heure(0), st: r.ouvert ? 'Lu' : 'Parti' }]) });
    if (r.ouvert) et.push({ c: 'fait', i: 'oeil', t: 'Devis ouvert par le client', d: jjm(r.ouvert) });
    var r3 = r.relances.filter(function (x) { return x.j === 3; })[0], r7 = r.relances.filter(function (x) { return x.j === 7; })[0];
    var repAvant = r.reponse && (!r3 || r.reponse < r3.date);
    if (repAvant) et.push(etapeRep(r, m, heure));
    if (r3) et.push(etapeRel(r, r3, m, heure));
    else if (!r.reponse && r.statut === 'En cours') et.push({ c: 'futur', i: 'wa', t: 'Relance à 3 jours par WhatsApp', d: 'prévue ' + jjm(plus(r.date, 3)) });
    if (r.reponse && !repAvant && (!r7 || r.reponse < r7.date)) et.push(etapeRep(r, m, heure));
    if (r7) et.push(etapeRel(r, r7, m, heure));
    else if (r3 && !r.reponse && r.statut === 'En cours') et.push({ c: 'futur', i: 'mail', t: 'Relance à 7 jours par e-mail', d: 'prévue ' + jjm(plus(r.date, 7)) });
    if (r.reponse && r7 && r.reponse >= r7.date) et.push(etapeRep(r, m, heure));
    if (r.rdv) et.push({ c: r.rdv <= AUJ ? 'fait' : 'futur', i: 'cal', t: r.qte > 1 ? 'Rendez-vous de présentation' : 'Essai au showroom', d: (r.rdv <= AUJ ? '' : 'prévu ') + jjm(r.rdv) + ', avec ' + VEND[r.vendeur].nom });
    if (r.statut === 'Signé') et.push({ c: 'vert', i: 'ok', t: 'Bon de commande signé', d: jjm(fin) + ', ' + mf(r.valeur) + ' FCFA' });
    if (r.statut === 'Perdu') et.push({ c: 'fait', i: 'croix', t: 'Perdu : ' + r.motif.toLowerCase(), d: jjm(fin) + (r.reconq && r.reconq.modele ? ', à reconquérir avec la ' + r.reconq.modele : '') });
    var st = r.statut === 'Signé' ? badge('vert', 'Signé') : (r.statut === 'Perdu' ? badge('rouge', 'Perdu') : badge('orange', 'En cours'));
    return '<div class="fr-tete"><div><h2>' + esc(r.client) + '</h2><p>' + (r.entreprise ? esc(r.entreprise) + ', ' : '') + (r.qte > 1 ? r.qte + ' ' : '') + r.modele + ', ' + mf(r.valeur) + ' FCFA, ' + VEND[r.vendeur].nom + ', ' + VEND[r.vendeur].site + '</p></div>' + st + '</div>' +
      '<ol class="frise">' + et.map(function (e) { return '<li class="et ' + e.c + '"><div class="pt">' + ICO[e.i] + '</div><div><div class="et-h"><b>' + e.t + '</b><span>' + e.d + '</span></div>' + (e.h || '') + '</div></li>'; }).join('') + '</ol>';
  }
  function etapeRep(r, m, heure) { return { c: 'vert', i: 'rep', t: 'Réponse du client', d: jjm(r.reponse), h: wa([{ t: m.rep, h: heure(3), inn: true }]) }; }
  function etapeRel(r, x, m, heure) {
    var st = statutRel(x, r), cle = r.n + x.j;
    var aval = st === 'À valider';
    var lib = { 'Parti': 'Parti', 'Lu': 'Lu', 'Ouvert': 'Ouvert', 'Répondu': 'Répondu', 'À valider': 'À valider', 'Validé': 'Validé, part à 9 h' }[st];
    var b = badge(st === 'Répondu' ? 'vert' : (aval ? 'orange' : (st === 'Validé' ? 'vert' : 'gris')), lib);
    var corps = x.canal === 'WhatsApp' ? wa([{ t: m.j3, h: aval || st === 'Validé' ? 'brouillon' : heure(1), st: st === 'Parti' ? 'Parti' : 'Lu', piece: x.contenu }], aval || st === 'Validé')
      : mail(VEND[r.vendeur].nom, r.client, m.j7o, m.j7, aval || st === 'Validé' ? 'Brouillon' : (st === 'Parti' ? 'Envoyé, pas encore ouvert' : (st === 'Répondu' ? 'Ouvert, le client a répondu' : 'Ouvert par le client')));
    if (aval) corps += '<div class="valider"><button class="btn plein" data-valider="' + cle + '">' + ICO.ok + 'Valider</button><button class="btn" data-modifier="1">Modifier</button><span class="note">Validée par le chef des ventes, elle part à 9 h.</span></div>';
    return { c: aval ? 'attente' : 'fait', i: x.canal === 'WhatsApp' ? 'wa' : 'mail', t: 'Relance à ' + x.j + ' jours par ' + (x.canal === 'E-mail' ? 'e-mail' : x.canal) + ' ' + b, d: jjm(x.date) + (x.canal === 'WhatsApp' ? ', contenu : ' + x.contenu.toLowerCase() : ''), h: corps };
  }
  function wa(L, brouillon) {
    return '<div class="wa">' + L.map(function (b) {
      var p = b.piece ? '<div class="piece">' + vign(b.piece) + '<small><b>' + { 'Vidéo': 'Vidéo, 45 s', 'Catalogue': 'Catalogue PDF, 6 pages', 'Photo': '3 photos' }[b.piece] + '</b></small></div>' : '';
      return '<div class="bul' + (b.inn ? ' in' : '') + '">' + p + esc(b.t) + '<div class="meta">' + (brouillon ? 'brouillon, non envoyé' : b.h + (b.inn ? '' : ' ' + tique(b.st))) + '</div></div>';
    }).join('') + '</div>';
  }
  function mail(de, a, obj, txt, pied) {
    return '<div class="mail"><div class="mail-h">De : <b>' + de + '</b>, CFAO Mobility<br>À : <b>' + esc(a) + '</b><br>Objet : <b>' + esc(obj) + '</b></div><div class="mail-c">' + esc(txt) + '</div><div class="mail-p"><span>' + ICO.mail.replace('class="ico"', 'class="ico" style="width:13px;height:13px;vertical-align:-2px"') + ' ' + pied + '</span></div></div>';
  }
  function pas(r) {
    var p = [r.date ? 'ok' : '', r.ouvert ? 'ok' : ''];
    var r3 = r.relances.filter(function (x) { return x.j === 3; })[0], r7 = r.relances.filter(function (x) { return x.j === 7; })[0];
    p.push(r3 ? (statutRel(r3, r) === 'À valider' ? 'a' : 'ok') : '');
    p.push(r7 ? (statutRel(r7, r) === 'À valider' ? 'a' : 'ok') : '');
    p.push(r.reponse ? 'v' : ''); p.push(r.rdv && r.rdv <= AUJ ? 'v' : '');
    return '<span class="pas" title="Devis, ouvert, relance 3 j, relance 7 j, réponse, essai">' + p.map(function (c) { return '<i class="' + c + '"></i>'; }).join('') + '</span>';
  }
  function rendreRelances() {
    var L = devisPer().filter(function (r) { return r.relances.length; });
    var envois = 0, lus = 0, rep = 0;
    L.forEach(function (r) { r.relances.forEach(function (x) { var s = statutRel(x, r); if (s === 'À valider' || s === 'Validé') return; envois++; if (s !== 'Parti') lus++; if (s === 'Répondu') rep++; }); });
    var aval = relancesAValider().filter(function (o) { return true; });
    var h = kpi('', 'envoi', 'Relances parties', fmt(envois), 'WhatsApp à 3 jours, e-mail à 7 jours');
    h += kpi('', 'oeil', 'Lues ou ouvertes', pct(lus / Math.max(1, envois)), fmt(lus) + ' relances');
    h += kpi('vert', 'rep', 'Réponse après relance', pct(rep / Math.max(1, envois)), fmt(rep) + ' relances suivies d\'une réponse');
    h += kpi('orange', 'attente', 'En attente de validation', fmt(aval.length), 'rien ne part sans le chef des ventes');
    $('k-relances').innerHTML = h;
    var tris = [['tous', 'Tous'], ['valider', 'À valider'], ['repondu', 'Ont répondu'], ['silence', 'Sans réponse']];
    $('tri-rel').innerHTML = tris.map(function (t) { return '<button class="chip' + (E.triRel === t[0] ? ' on' : '') + '" data-trirel="' + t[0] + '">' + t[1] + '</button>'; }).join('');
    var base = devisPer().filter(function (r) { return r.relances.length || r.reponse || r.statut === 'En cours'; });
    var F = base.filter(function (r) {
      if (E.triRel === 'valider') return r.relances.some(function (x) { return statutRel(x, r) === 'À valider'; });
      if (E.triRel === 'repondu') return !!r.reponse;
      if (E.triRel === 'silence') return !r.reponse;
      return true;
    }).sort(function (a, b) {
      var va = a.relances.some(function (x) { return statutRel(x, a) === 'À valider'; }) ? 1 : 0, vb = b.relances.some(function (x) { return statutRel(x, b) === 'À valider'; }) ? 1 : 0;
      return vb - va || (a.date < b.date ? 1 : -1);
    });
    if (!E.sel || !F.some(function (r) { return r.n === E.sel; })) E.sel = F.length ? F[0].n : null;
    $('liste-rel').innerHTML = F.length ? F.slice(0, 60).map(function (r) {
      var st = r.statut === 'Signé' ? badge('vert', 'Signé') : (r.statut === 'Perdu' ? badge('rouge', 'Perdu') : (r.relances.some(function (x) { return statutRel(x, r) === 'À valider'; }) ? badge('orange', 'À valider') : badge('gris', 'En cours')));
      return '<div class="cl-rel' + (E.sel === r.n ? ' sel' : '') + '" data-sel="' + r.n + '"><div class="av' + (r.statut === 'Perdu' ? ' rouge' : '') + '">' + ini(r.client) + '</div><div class="txt"><b>' + esc(r.client) + '</b><span>' + r.modele + ', ' + jm(r.date) + ', ' + prenom(r.vendeur) + '</span></div>' + pas(r) + st + '</div>';
    }).join('') + (F.length > 60 ? '<p class="note">60 premiers sur ' + F.length + '. Affiner avec les filtres.</p>' : '') : '<div class="vide">Aucun client avec ces filtres.</div>';
    var r = D.devis.filter(function (x) { return x.n === E.sel; })[0];
    $('frise').innerHTML = r ? frise(r) : '<div class="vide">Choisir un client.</div>';
  }

  // ---------- TESTS A/B ----------
  function abStats(L) {
    var o = {}; D.CONTENUS.forEach(function (c) { o[c] = { n: 0, rep: 0, rdv: 0 }; });
    L.forEach(function (r) {
      r.relances.forEach(function (x) {
        if (x.j !== 3 || x.statut === 'À valider') return;
        if (ecart(x.date, AUJ) < 4) return;
        var s = o[x.contenu]; s.n++;
        if (x.statut === 'Répondu') { s.rep++; if (r.rdv) s.rdv++; }
      });
    });
    return o;
  }
  function pval(a, na, b, nb) {
    if (!na || !nb) return 1;
    var p = (a + b) / (na + nb), se = Math.sqrt(p * (1 - p) * (1 / na + 1 / nb)); if (!se) return 1;
    var z = Math.abs(a / na - b / nb) / se;
    var t = 1 / (1 + .2316419 * z), d = .3989423 * Math.exp(-z * z / 2);
    var q = d * t * (.3193815 + t * (-.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return 2 * q;
  }
  function rendreAB() {
    var L = D.devis.filter(okDims), o = abStats(L);
    var cl = D.CONTENUS.slice().sort(function (a, b) { return (o[b].rep / Math.max(1, o[b].n)) - (o[a].rep / Math.max(1, o[a].n)); });
    var g = cl[0], s2 = cl[1], pv = pval(o[g].rep, o[g].n, o[s2].rep, o[s2].n), p3 = pval(o[g].rep, o[g].n, o[cl[2]].rep, o[cl[2]].n);
    var net = pv < .05;
    var tot = D.CONTENUS.reduce(function (a, c) { return a + o[c].n; }, 0);
    $('ab-cartes').innerHTML = D.CONTENUS.map(function (c) {
      var s = o[c], w = c === g && (net || p3 < .05);
      return '<div class="ab' + (w ? ' gagne' : '') + '"><div class="ab-t">' + vign(c) + c + '</div>' + (w ? '<span class="ruban">' + badge('vert', c === g && net ? 'Gagnant' : 'En tête') + '</span>' : '') +
        '<div class="ab-g"><div><b>' + pct(s.rep / Math.max(1, s.n)) + '</b><span>répondent</span></div><div><b>' + pct(s.rdv / Math.max(1, s.n)) + '</b><span>prennent un essai</span></div></div>' +
        '<div class="ab-n">' + s.n + ' relances envoyées, ' + s.rep + ' réponses, ' + s.rdv + ' essais</div></div>';
    }).join('');
    var v = $('verdict');
    var rg = o[g].rep / Math.max(1, o[g].n), r2 = o[s2].rep / Math.max(1, o[s2].n), r3 = o[cl[2]].rep / Math.max(1, o[cl[2]].n);
    if (tot < 30) { v.className = 'bloc verdict attente'; v.innerHTML = '<div class="gros">' + ICO.attente + '</div><div><h2>Pas assez de relances pour conclure</h2><p>' + tot + ' relances sur ces filtres. Élargir la période ou retirer un filtre.</p></div>'; }
    else if (net) { v.className = 'bloc verdict'; v.innerHTML = '<div class="gros">' + ICO.trophee + '</div><div><h2>' + g + ' : le contenu qui fait répondre</h2><p>' + pct(rg) + ' de réponses contre ' + pct(r2) + ' pour ' + s2.toLowerCase() + ' et ' + pct(r3) + ' pour ' + cl[2].toLowerCase() + '. L\'écart est net (moins de ' + (pv < .01 ? '1' : '5') + ' chances sur 100 d\'être dû au hasard). Proposition : passer la relance à 3 jours en ' + g.toLowerCase() + ' pour tous les modèles, à valider par le chef des ventes.</p></div>'; }
    else if (p3 < .05) { v.className = 'bloc verdict attente'; v.innerHTML = '<div class="gros">' + ICO.attente + '</div><div><h2>' + g + ' en tête, ' + cl[2].toLowerCase() + ' nettement derrière</h2><p>' + pct(rg) + ' de réponses pour ' + g.toLowerCase() + ', ' + pct(r2) + ' pour ' + s2.toLowerCase() + ' : l\'écart entre les deux premiers n\'est pas encore net, le test continue. ' + cl[2] + ' (' + pct(r3) + ') peut déjà être retiré du test.</p></div>'; }
    else { v.className = 'bloc verdict attente'; v.innerHTML = '<div class="gros">' + ICO.attente + '</div><div><h2>Pas encore d\'écart net</h2><p>' + g + ' devant avec ' + pct(rg) + ' de réponses, mais l\'écart peut encore venir du hasard. Le test continue.</p></div>'; }
    if (chAb) chAb.destroy();
    chAb = new Chart($('c-ab'), {
      type: 'bar',
      data: { labels: D.CONTENUS, datasets: [
        { label: 'Répondent', data: D.CONTENUS.map(function (c) { return Math.round(100 * o[c].rep / Math.max(1, o[c].n)); }), backgroundColor: '#00438D', borderRadius: 6, maxBarThickness: 46 },
        { label: 'Prennent un essai', data: D.CONTENUS.map(function (c) { return Math.round(100 * o[c].rdv / Math.max(1, o[c].n)); }), backgroundColor: '#8FB0D8', borderRadius: 6, maxBarThickness: 46 }] },
      options: { maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { family: 'Inter', size: 12 } } },
        tooltip: { callbacks: { label: function (c) { return c.dataset.label + ' : ' + c.parsed.y + ' %'; } } } },
        scales: { y: { beginAtZero: true, ticks: { callback: function (v) { return v + ' %'; }, font: { size: 11 } }, grid: { color: '#EEF1F5' } }, x: { grid: { display: false } } } }
    });
    var h = '<table class="mat"><thead><tr><th>Modèle</th>' + D.CONTENUS.map(function (c) { return '<th>' + c + '</th>'; }).join('') + '</tr></thead><tbody>';
    D.MODELES.forEach(function (m) {
      var om = abStats(L.filter(function (r) { return r.modele === m.nom; }));
      h += '<tr><td>' + m.nom + '</td>' + D.CONTENUS.map(function (c) {
        var s = om[c]; if (s.n < 5) return '<td><div class="c" style="background:#F7F8FA;color:#B0B3BD">' + (s.n ? s.n + ' env.' : '') + '</div></td>';
        var t = s.rep / s.n, a = Math.min(1, t / .7);
        return '<td><div class="c" style="background:rgba(0,67,141,' + (0.08 + a * .75).toFixed(2) + ');color:' + (a > .5 ? '#fff' : '#00438D') + '" title="' + s.rep + ' réponses sur ' + s.n + '">' + pct(t) + '</div></td>';
      }).join('') + '</tr>';
    });
    $('ab-modele').innerHTML = h + '</tbody></table>';
  }

  // ---------- rendu global ----------
  function tout() {
    etatFiltres();
    if (E.onglet === 'jour') rendreJour();
    if (E.onglet === 'devis') rendreDevis();
    if (E.onglet === 'perdus') rendrePerdus();
    if (E.onglet === 'relances') rendreRelances();
    if (E.onglet === 'ab') rendreAB();
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-frise],[data-aller],[data-vend],[data-modele],[data-canal],[data-motif],[data-trirq],[data-trirel],[data-sel],[data-valider],[data-modifier],#plus-rq');
    if (!t) return;
    var ds = t.dataset;
    if (ds.frise) { E.sel = ds.frise; E.triRel = 'tous'; var r = D.devis.filter(function (x) { return x.n === ds.frise; })[0]; if (r && !okPer(r.date)) E.per = 6; aller('relances', false); ouvrirFrise(); return; }
    if (ds.aller) { aller(ds.aller); return; }
    if (ds.vend) { E.vendeur = E.vendeur === ds.vend ? '' : ds.vend; tout(); return; }
    if (ds.modele !== undefined && t.classList.contains('db')) { E.modele = E.modele === ds.modele ? '' : ds.modele; tout(); return; }
    if (ds.canal !== undefined && t.classList.contains('db')) { E.canal = E.canal === ds.canal ? '' : ds.canal; tout(); return; }
    if (ds.motif) { E.motif = E.motif === ds.motif ? '' : ds.motif; E.plusRq = false; tout(); return; }
    if (ds.trirq) { E.triRq = ds.trirq; E.plusRq = false; tout(); return; }
    if (ds.trirel) { E.triRel = ds.trirel; E.sel = null; tout(); return; }
    if (ds.sel) { E.sel = ds.sel; tout(); ouvrirFrise(); return; }
    if (ds.valider) { E.valides[ds.valider] = true; tout(); return; }
    if (ds.modifier) { $('modale-c').innerHTML = '<h2 style="font-size:18px;color:var(--bleu);margin-bottom:8px">Modifier la relance</h2><p style="margin:0;font-size:14px;color:#3a3d4f">Le conseiller corrige le texte ou change le contenu joint (vidéo, catalogue, photo), puis le chef des ventes valide. Rien ne part avant.</p>'; $('modale').hidden = false; return; }
    if (t.id === 'plus-rq') { E.plusRq = !E.plusRq; tout(); }
  });
  function ouvrirFrise() {
    if (window.innerWidth <= 1020) { var b = $('frise-bloc'); setTimeout(function () { b.scrollIntoView({ behavior: 'instant', block: 'start' }); }, 30); }
  }
  $('fermer').addEventListener('click', function () { $('modale').hidden = true; });
  $('modale').addEventListener('click', function (e) { if (e.target.id === 'modale') $('modale').hidden = true; });

  $('maj').textContent = 'À jour ' + JOURSL[dte(AUJ).getDay()] + ' ' + jm(AUJ) + ', 8 h';
  if (window.Chart) { Chart.defaults.font.family = 'Inter, system-ui, sans-serif'; Chart.defaults.color = '#6B6B78'; }
  onglets(); construireFiltres();
  var q = (location.hash || '').replace('#', '');
  aller(['jour', 'devis', 'perdus', 'relances', 'ab'].indexOf(q) >= 0 ? q : 'jour', false);
})();
