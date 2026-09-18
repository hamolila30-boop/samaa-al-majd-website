(() => {
  const form = document.querySelector('#visaForm');
  const nationality = form.elements.nationality;
  const result = document.querySelector('#visaResult');
  form.addEventListener('input', () => { result.hidden = true; });
  form.addEventListener('change', () => { result.hidden = true; });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const entries = [
      ['Nationality', nationality.value],
      ['Age', form.elements.age.value],
      ['Current Location', form.elements.location.value],
      ['Current Situation', form.elements.situation.value],
      ['University Degree', form.elements.degree.value]
    ];
    const summary = result.querySelector('dl');
    summary.replaceChildren(...entries.map(([label, value]) => {
      const row = document.createElement('div');
      const term = document.createElement('dt');
      const detail = document.createElement('dd');
      term.textContent = label === 'University Degree' ? 'Degree / attestation status' : label;
      detail.textContent = value;
      row.append(term, detail);
      return row;
    }));
    result.querySelector('.visa-age-note').hidden = Number(form.elements.age.value) < 60;
    const message = [
      'Hello SAMAA AL MAJD, I completed the UAE visa preliminary assessment and would like your team to review my case.',
      '', ...entries.map(([label, value]) => `${label}: ${value}`), '',
      'Please review my profile and advise me on the available visa/residency options.'
    ].join('\n');
    result.querySelector('a').href = `https://wa.me/971506161446?text=${encodeURIComponent(message)}`;
    result.hidden = false;
    result.querySelector('h3').focus({preventScroll: true});
    result.scrollIntoView({behavior: 'instant', block: 'start'});
  });
})();
