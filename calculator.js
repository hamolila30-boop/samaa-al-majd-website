(() => {
  const root = document.querySelector('#calculator');
  const state = { setup: '', visas: null, office: '' };
  const questions = root.querySelector('#costQuestions');
  const result = root.querySelector('#costResult');
  const back = root.querySelector('#costBack');
  const reset = root.querySelector('#resetCost');
  let step = 1;
  const money = n => `AED ${n.toLocaleString('en-US')}`;
  const range = (a, b) => `${money(a)} – ${money(b)}`;
  const visaLabel = () => state.visas === 'more' ? 'More than 3 visas' : state.visas === 0 ? 'No visa required' : `${state.visas} visa${state.visas === 1 ? '' : 's'}`;
  const officeLabel = () => state.office === 'physical' ? 'Physical Office' : 'Virtual / Flexible Office Assistance';

  function show(next, focus = true) {
    step = next;
    const total = state.setup === 'freezone' ? 2 : 3;
    questions.hidden = step === 4;
    result.hidden = step !== 4;
    back.hidden = step === 1;
    reset.hidden = step !== 4;
    root.querySelector('#costStepLabel').textContent = step === 4 ? 'Your preliminary summary' : `Step ${step} of ${total}${step === 1 ? ' · Choose your setup' : ''}`;
    root.querySelectorAll('.progress span').forEach((el, i) => {
      el.hidden = i >= total;
      el.classList.toggle('active', i < (step === 4 ? total : step));
    });
    root.querySelectorAll('.question').forEach(el => el.classList.toggle('active', Number(el.dataset.step) === step));
    root.querySelectorAll('[data-cost]').forEach(el => el.setAttribute('aria-pressed', el.dataset.cost === state.setup));
    root.querySelectorAll('[data-visas]').forEach(el => el.setAttribute('aria-pressed', el.dataset.visas === String(state.visas)));
    root.querySelectorAll('[data-office]').forEach(el => el.setAttribute('aria-pressed', el.dataset.office === state.office));
    if (focus) {
      const heading = step === 4 ? result.querySelector('h3') : root.querySelector('.question.active h3');
      heading.focus({ preventScroll: true });
      if (heading.getBoundingClientRect().top < 90) {
        window.scrollTo({ top: root.querySelector('.tool-box').getBoundingClientRect().top + window.scrollY - 90, behavior: 'instant' });
      }
    }
  }

  function estimate() {
    const mainland = state.setup === 'mainland';
    const tailored = state.visas === 'more';
    const amount = tailored ? 'Tailored quotation required' : mainland ? range(15000 + state.visas * 5000, 25000 + state.visas * 7000) : money(state.visas === 0 ? 14900 : 18900 + (state.visas - 1) * 4500);
    const row = (label, value) => `<div><dt>${label}</dt><dd>${value}</dd></div>`;
    const breakdown = mainland
      ? row('Preliminary company setup', range(15000, 25000)) + row('Estimated Visa Costs', tailored ? 'Requirement and cost to be confirmed by our team.' : state.visas === 0 ? 'No visa required' : range(state.visas * 5000, state.visas * 7000)) + row('Office Requirement', officeLabel()) + (state.office === 'flexible' ? row('Office Assistance', 'Up to approximately AED 5,000 additional. Separate from the range above; not a fixed charge.') : '')
      : '';
    const caveat = mainland
      ? 'This approximate range depends on business activity, license requirements, office / tenancy rental value, government and authority fees, number and type of visas, and any additional approvals required.'
      : 'The final amount may vary depending on the selected Free Zone, business activity, package, immigration requirements and applicable authority fees.';
    const payment = mainland ? '<aside class="cost-notice"><h4>Government Payment Notice</h4><p>Once the official payment voucher is issued online, you may pay the applicable government fees directly or request SAMAA AL MAJD to arrange payment on your behalf. Final government and licensing amounts may vary depending on the official payment voucher and applicable requirements.</p></aside>' : '';
    const message = [
      'Hello SAMAA AL MAJD, I used your UAE Business Setup Cost Calculator and would like an exact quotation.',
      `Setup: ${mainland ? 'Dubai Mainland' : 'UAE Free Zone'}`,
      `Visas Required: ${visaLabel()}`,
      ...(mainland ? [`Office Requirement: ${officeLabel()}`] : []),
      `${mainland ? 'Preliminary Estimate' : 'Preliminary Package Estimate'}: ${amount}`,
      ...(mainland && tailored ? [`Preliminary setup only: ${range(15000, 25000)}; visa costs to be confirmed.`] : []),
      ...(mainland && state.office === 'flexible' ? ['Office assistance: up to approximately AED 5,000 additional, not included in the estimate.'] : []),
      'Please provide me with a detailed quotation.'
    ].join('\n');
    result.innerHTML = `<h3 tabindex="-1">${mainland ? 'Dubai Mainland' : 'UAE Free Zone'}</h3><p class="cost-caption">${mainland ? 'Estimated Setup & Visa Range' : 'Preliminary package estimate'}</p><strong class="cost-amount">${amount}</strong><p class="cost-selection">${visaLabel()}</p>${tailored ? '<p class="cost-explanation">For more than 3 visas, our team will confirm your requirements and prepare a tailored quotation. No final total is calculated.</p>' : ''}<dl class="cost-breakdown">${breakdown}</dl><p class="cost-explanation">${caveat} ${mainland ? 'This is a preliminary estimate. Your final quotation will be confirmed after reviewing your exact requirements.' : 'This is an estimate, not a guaranteed final quotation.'}</p>${payment}<a id="costWhatsApp" class="button gold" target="_blank" rel="noopener noreferrer" href="https://wa.me/971506161446?text=${encodeURIComponent(message)}">GET MY EXACT QUOTATION <span aria-hidden="true">→</span></a><p class="cost-whatsapp-note">Continue on WhatsApp with our team for a detailed quotation based on your requirements.</p>`;
    show(4);
  }

  root.querySelectorAll('[data-cost]').forEach(button => button.addEventListener('click', () => {
    if (state.setup !== button.dataset.cost) Object.assign(state, {visas: null, office: ''});
    state.setup = button.dataset.cost;
    show(2);
  }));
  root.querySelectorAll('[data-visas]').forEach(button => button.addEventListener('click', () => {
    state.visas = button.dataset.visas === 'more' ? 'more' : Number(button.dataset.visas);
    if (state.setup === 'freezone') estimate(); else show(3);
  }));
  root.querySelectorAll('[data-office]').forEach(button => button.addEventListener('click', () => {
    state.office = button.dataset.office;
    estimate();
  }));
  back.addEventListener('click', () => show(step === 4 ? state.setup === 'mainland' ? 3 : 2 : step - 1));
  reset.addEventListener('click', () => { Object.assign(state, {setup: '', visas: null, office: ''}); show(1); });
  show(1, false);
})();
