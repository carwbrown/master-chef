/**
 * Reusable add/edit event modal, shared by the Hub (day view) and the Week view.
 * Injects its own <dialog> once, so a page only needs:
 *
 *   import { createEventModal } from './scripts/event-modal.js';
 *   const eventModal = createEventModal({ members, onChange: render, getDefaultDate: () => currentDate });
 *   eventModal.openNew();      // uses getDefaultDate()
 *   eventModal.openNew(date);  // for a specific day (week view)
 *   eventModal.openEdit(ev);
 */
import { pb } from './auth.js';
import { escapeHTML } from './utils.js';
import { ymd, WD } from './recurrence.js';

const pad = (n) => String(n).padStart(2, '0');
const dateInput = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const toPBDate = (v) => v ? `${v} 00:00:00.000Z` : '';
const ordinal = (n) => { const s = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); };
const WD_LABEL = { sun: 'S', mon: 'M', tue: 'T', wed: 'W', thu: 'T', fri: 'F', sat: 'S' };
const WD_FULL = { sun: 'Sunday', mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday' };

const DIALOG_HTML = `
  <dialog class="modal" id="eventDialog">
    <form id="eventForm">
      <h3 id="dlgTitle">New event</h3>
      <input type="hidden" name="id">
      <label>Title <input type="text" name="title" required placeholder="e.g. Soccer practice"></label>
      <label>Who
        <select name="member" id="memberSelect"><option value="">Everyone</option></select>
      </label>
      <div class="pd-row">
        <label>Pickup <select name="pickup" id="pickupSelect"><option value="">—</option></select></label>
        <label>Drop-off <select name="dropoff" id="dropoffSelect"><option value="">—</option></select></label>
      </div>
      <label>Who's watching <input type="text" name="caregiver" placeholder="optional — e.g. Grandma, sitter"></label>
      <label>Date <input type="date" name="date" id="dateField" required></label>
      <label class="row"><input type="checkbox" name="all_day" id="allDayField"> All day</label>
      <div class="times" id="timeFields">
        <label>Start <input type="time" name="start_time"></label>
        <label>End <input type="time" name="end_time"></label>
      </div>
      <label>Repeat
        <select name="recur_type" id="recurType">
          <option value="none">Does not repeat</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </label>
      <div class="wd-picker" id="weeklyDays" hidden></div>
      <div id="monthlyOpts" hidden>
        <label class="row"><input type="radio" name="monthly_kind" value="day_of_month" checked> <span id="domLabel"></span></label>
        <label class="row"><input type="radio" name="monthly_kind" value="nth_weekday"> <span id="nthLabel"></span></label>
      </div>
      <label id="untilWrap" hidden>Ends (optional) <input type="date" name="recur_until"></label>
      <label>Notes <textarea name="notes" rows="2" placeholder="optional"></textarea></label>
      <div class="modal-actions">
        <button type="button" class="btn danger" id="deleteBtn" hidden>Delete</button>
        <span style="flex:1"></span>
        <button type="button" class="btn" id="cancelBtn">Cancel</button>
        <button type="submit" class="btn btn-primary">Save</button>
      </div>
    </form>
  </dialog>`;

export function createEventModal({ members = [], onChange, getDefaultDate } = {}) {
  let dlg = document.getElementById('eventDialog');
  if (!dlg) {
    const wrap = document.createElement('div');
    wrap.innerHTML = DIALOG_HTML.trim();
    document.body.appendChild(wrap.firstElementChild);
    dlg = document.getElementById('eventDialog');
  }
  const form = document.getElementById('eventForm');
  const $ = (id) => document.getElementById(id);
  const defaultDate = () => (getDefaultDate ? getDefaultDate() : new Date());

  const memberOpts = members.map(m => `<option value="${m.id}">${escapeHTML(m.name)}</option>`).join('');
  $('memberSelect').innerHTML = `<option value="">Everyone</option>` + memberOpts;
  $('pickupSelect').innerHTML = `<option value="">—</option>` + memberOpts;
  $('dropoffSelect').innerHTML = `<option value="">—</option>` + memberOpts;
  $('weeklyDays').innerHTML = WD.map(d =>
    `<label><input type="checkbox" name="wd" value="${d}"><span>${WD_LABEL[d]}</span></label>`).join('');

  function syncConditionals() {
    const type = $('recurType').value;
    $('timeFields').style.display = $('allDayField').checked ? 'none' : 'flex';
    $('weeklyDays').hidden = type !== 'weekly';
    $('monthlyOpts').hidden = type !== 'monthly';
    $('untilWrap').hidden = type === 'none';
    if (type === 'monthly') updateMonthlyLabels();
  }

  function updateMonthlyLabels() {
    const v = $('dateField').value;
    if (!v) return;
    const d = ymd(v);
    $('domLabel').textContent = `On the ${ordinal(d.getDate())}`;
    const nth = Math.ceil(d.getDate() / 7);
    $('nthLabel').textContent = `On the ${ordinal(nth)} ${WD_FULL[WD[d.getDay()]]}`;
  }

  function buildRecurConfig(type) {
    if (type === 'weekly') {
      return { days: [...form.querySelectorAll('input[name="wd"]:checked')].map(c => c.value) };
    }
    if (type === 'monthly') {
      const d = ymd($('dateField').value);
      const kind = form.monthly_kind.value;
      return kind === 'nth_weekday'
        ? { monthly: { kind, nth: Math.ceil(d.getDate() / 7), weekday: WD[d.getDay()] } }
        : { monthly: { kind: 'day_of_month', day: d.getDate() } };
    }
    return {};
  }

  function openNew(date) {
    form.reset();
    form.id.value = '';
    $('dlgTitle').textContent = 'New event';
    $('deleteBtn').hidden = true;
    $('dateField').value = dateInput(date || defaultDate());
    $('recurType').value = 'none';
    syncConditionals();
    dlg.showModal();
  }

  function openEdit(ev) {
    if (!ev) return;
    form.reset();
    form.id.value = ev.id;
    $('dlgTitle').textContent = 'Edit event';
    $('deleteBtn').hidden = false;
    form.title.value = ev.title || '';
    form.member.value = ev.member || '';
    form.pickup.value = ev.pickup || '';
    form.dropoff.value = ev.dropoff || '';
    form.caregiver.value = ev.caregiver || '';
    form.notes.value = ev.notes || '';
    $('dateField').value = ev.date ? ev.date.slice(0, 10) : dateInput(defaultDate());
    $('allDayField').checked = !!ev.all_day;
    form.start_time.value = ev.start_time || '';
    form.end_time.value = ev.end_time || '';
    $('recurType').value = ev.recur_type || 'none';
    form.recur_until.value = ev.recur_until ? ev.recur_until.slice(0, 10) : '';
    const cfg = ev.recur_config || {};
    (cfg.days || []).forEach(d => { const b = form.querySelector(`input[name="wd"][value="${d}"]`); if (b) b.checked = true; });
    if (cfg.monthly && cfg.monthly.kind)
      form.querySelector(`input[name="monthly_kind"][value="${cfg.monthly.kind}"]`).checked = true;
    syncConditionals();
    dlg.showModal();
  }

  async function onSave(e) {
    e.preventDefault();
    const type = $('recurType').value;
    const allDay = $('allDayField').checked;
    const data = {
      title: form.title.value.trim(),
      member: form.member.value || null,
      pickup: form.pickup.value || null,
      dropoff: form.dropoff.value || null,
      caregiver: form.caregiver.value.trim(),
      notes: form.notes.value.trim(),
      date: toPBDate($('dateField').value),
      all_day: allDay,
      start_time: allDay ? '' : form.start_time.value,
      end_time: allDay ? '' : form.end_time.value,
      recur_type: type,
      recur_config: buildRecurConfig(type),
      recur_until: type !== 'none' ? toPBDate(form.recur_until.value) : '',
    };
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    try {
      if (form.id.value) await pb.collection('events').update(form.id.value, data);
      else await pb.collection('events').create(data);
      dlg.close();
      await onChange?.();
    } catch (err) {
      alert('Could not save: ' + (err?.message || err));
    } finally { btn.disabled = false; }
  }

  async function onDelete() {
    if (!form.id.value || !confirm('Delete this event?')) return;
    try { await pb.collection('events').delete(form.id.value); dlg.close(); await onChange?.(); }
    catch (err) { alert('Could not delete: ' + (err?.message || err)); }
  }

  $('allDayField').addEventListener('change', syncConditionals);
  $('recurType').addEventListener('change', syncConditionals);
  $('dateField').addEventListener('change', updateMonthlyLabels);
  $('cancelBtn').onclick = () => dlg.close();
  $('deleteBtn').onclick = onDelete;
  form.addEventListener('submit', onSave);

  return { openNew, openEdit };
}
