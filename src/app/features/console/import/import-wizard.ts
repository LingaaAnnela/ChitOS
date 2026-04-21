import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ImportStore } from './import.store';

@Component({
  selector: 'app-import-wizard',
  standalone: true,
  providers: [ImportStore],
  imports: [],
  styles: [`
    :host { display: flex; flex-direction: column; padding: 20px; gap: 16px; }

    .page-title { font-family: var(--font-serif); font-size: 22px; font-weight: 300; color: var(--t1); margin-bottom: 3px; }
    .page-sub { font-size: 12px; color: var(--t3); }

    /* ── Step indicator ─────────────────────────────── */
    .steps { display: flex; }
    .step-tab {
      flex: 1; padding: 10px; text-align: center; font-size: 12px; font-weight: 500;
      cursor: default; user-select: none;
    }
    .step-tab:first-child { border-radius: var(--rs) 0 0 var(--rs); }
    .step-tab:last-child  { border-radius: 0 var(--rs) var(--rs) 0; }
    .step-tab.step-active { background: var(--t1); color: #fff; }
    .step-tab.step-done   { background: var(--gbg); color: var(--green); }
    .step-tab.step-future {
      background: var(--warm2); color: var(--t3);
      border-top: 0.5px solid var(--b2); border-bottom: 0.5px solid var(--b2);
    }
    .step-tab:first-child.step-future { border-left: 0.5px solid var(--b2); }
    .step-tab:last-child.step-future  { border-right: 0.5px solid var(--b2); }
    .step-lbl { display: inline; }

    /* ── Form elements ──────────────────────────────── */
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .form-group { display: flex; flex-direction: column; gap: 5px; }
    .form-label {
      font-size: 11px; font-weight: 500; color: var(--t3);
      text-transform: uppercase; letter-spacing: 0.5px; font-family: var(--font-mono);
    }
    .form-input {
      width: 100%; padding: 9px 12px; border: 0.5px solid var(--b2);
      border-radius: var(--rs); font-size: 13px; color: var(--t1);
      background: var(--card); outline: none; font-family: inherit;
    }
    .form-input:focus { border-color: rgba(22,163,74,0.5); }
    .form-hint { font-size: 11px; color: var(--t3); margin-top: 3px; }

    .amber-box {
      background: var(--abg); border: 0.5px solid var(--ab);
      border-radius: var(--rs); padding: 12px;
    }
    .amber-label { font-size: 12px; font-weight: 500; color: #92400E; margin-bottom: 6px; }

    /* ── Step 1 layout ──────────────────────────────── */
    .step1-layout { display: flex; flex-direction: column; gap: 14px; }
    .step1-form   { display: flex; flex-direction: column; gap: 14px; }
    .step-card    { padding: 20px; display: flex; flex-direction: column; gap: 14px; }

    .preview-card  { padding: 14px; }
    .preview-title {
      font-size: 11px; font-weight: 500; color: var(--t3);
      text-transform: uppercase; letter-spacing: 0.5px; font-family: var(--font-mono);
      margin-bottom: 10px;
    }
    .preview-row { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 0.5px solid var(--b); }
    .preview-row:last-child { border-bottom: none; }
    .preview-lbl { font-size: 12px; color: var(--t2); }
    .preview-val { font-size: 12px; font-weight: 500; color: var(--t1); font-family: var(--font-mono); }

    /* ── Buttons ────────────────────────────────────── */
    .btn-sm {
      font-size: 12px; font-weight: 500; padding: 7px 16px; border-radius: 100px;
      cursor: pointer; border: none; font-family: inherit; white-space: nowrap;
    }
    .btn-sm-p { background: var(--t1); color: #fff; border: 0.5px solid transparent; }
    .btn-sm-p:hover:not(:disabled) { background: #333; }
    .btn-sm-p:disabled { opacity: 0.4; cursor: not-allowed; }
    .btn-sm-o { background: none; color: var(--t1); border: 0.5px solid var(--b2); }
    .btn-sm-o:hover { background: var(--warm); }

    .step-footer    { display: flex; justify-content: flex-end; gap: 8px; }
    .step-footer-sb { justify-content: space-between; }

    /* ── Step 2 — payouts ───────────────────────────── */
    .step-heading { font-size: 13px; font-weight: 500; color: var(--t1); }
    .payout-header { display: grid; grid-template-columns: 60px 1fr 130px; gap: 10px; align-items: center; padding: 8px 10px; background: var(--warm2); border-radius: var(--rs); }
    .payout-row    { display: grid; grid-template-columns: 60px 1fr 130px; gap: 10px; align-items: center; padding: 8px 10px; border: 0.5px solid var(--b); border-radius: var(--rs); }
    .payout-lbl    { font-size: 12px; font-weight: 500; color: var(--t1); }
    .payout-head   { font-size: 12px; color: var(--t3); }

    /* ── Step 3 — contributions ─────────────────────── */
    .contrib-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
    .contrib-tbl { width: 100%; border-collapse: collapse; font-size: 12px; min-width: 360px; }
    .contrib-tbl th {
      padding: 8px 6px; background: var(--warm2); text-align: center;
      color: var(--t3); font-weight: 500; border-bottom: 0.5px solid var(--b2);
    }
    .contrib-tbl th:first-child { text-align: left; padding-left: 10px; }
    .contrib-tbl td { padding: 5px 4px; border-bottom: 0.5px solid var(--b); vertical-align: middle; text-align: center; }
    .contrib-tbl td:first-child { padding: 7px 10px; font-weight: 500; white-space: nowrap; text-align: left; }
    .contrib-tbl tr:last-child td { border-bottom: none; }
    .cell-input {
      width: 64px; padding: 5px; border: 0.5px solid var(--b2); border-radius: 6px;
      font-size: 11px; text-align: center; font-family: inherit; background: var(--card);
    }
    .cell-input:focus { outline: none; border-color: rgba(22,163,74,0.5); }

    .contrib-desktop  { display: block; }
    .contrib-mobile   { display: none; flex-direction: column; gap: 8px; }

    .acc-item { border: 0.5px solid var(--b); border-radius: var(--rs); overflow: hidden; }
    .acc-header { display: flex; align-items: center; justify-content: space-between; padding: 11px 14px; cursor: pointer; background: var(--card); }
    .acc-label  { font-size: 13px; font-weight: 500; color: var(--t1); }
    .acc-chev   { width: 14px; height: 14px; stroke: var(--t3); fill: none; stroke-width: 1.5; stroke-linecap: round; transition: transform 0.2s; }
    .acc-chev.open { transform: rotate(180deg); }
    .acc-body   { padding: 10px 14px; background: var(--warm); display: flex; flex-direction: column; gap: 8px; border-top: 0.5px solid var(--b); }
    .acc-period-row { display: flex; align-items: center; justify-content: space-between; }
    .acc-period-lbl { font-size: 12px; color: var(--t2); }

    /* ── Step 4 — review ────────────────────────────── */
    .step-sub { font-size: 12px; color: var(--t3); }
    .review-row { display: flex; justify-content: space-between; align-items: center; padding: 9px 0; border-bottom: 0.5px solid var(--b); }
    .review-row:last-child { border-bottom: none; }
    .review-lbl { font-size: 12px; color: var(--t2); }
    .review-val { font-size: 12px; font-weight: 500; color: var(--t1); }
    .review-val-g { color: var(--green); }
    .green-box {
      background: var(--gbg); border: 0.5px solid var(--gb);
      border-radius: var(--rs); padding: 12px; font-size: 12px; color: #15803D; line-height: 1.5;
    }

    /* ── Step 5 — success ───────────────────────────── */
    .success-wrap { padding: 32px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 12px; }
    .success-icon { width: 56px; height: 56px; border-radius: 50%; background: var(--gbg); border: 0.5px solid var(--gb); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .success-title { font-family: var(--font-serif); font-size: 22px; font-weight: 300; color: var(--t1); }
    .success-sub { font-size: 13px; color: var(--t2); line-height: 1.6; max-width: 320px; }

    /* ── Spinner ────────────────────────────────────── */
    .spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.6s linear infinite; display: inline-block; vertical-align: middle; margin-right: 4px; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Responsive ─────────────────────────────────── */
    @media (max-width: 768px) {
      :host { padding: 14px; gap: 12px; }
      .page-title { font-size: 18px; }
      .form-row { grid-template-columns: 1fr; gap: 10px; }
      .payout-header, .payout-row { grid-template-columns: 46px 1fr 100px; gap: 8px; }
      .contrib-desktop { display: none; }
      .contrib-mobile  { display: flex; }
      .step-lbl { display: none; }
    }
    @media (min-width: 769px) {
      .step1-layout { flex-direction: row; align-items: flex-start; }
      .step1-form   { flex: 1; }
      .preview-card { width: 220px; flex-shrink: 0; }
    }
  `],
  template: `
    <div>
      <div class="page-title">Import existing chit</div>
      <div class="page-sub">Already running a chit on paper or WhatsApp? Import your history and track going forward.</div>
    </div>

    <!-- Step indicator -->
    <div class="steps">
      @for (tab of stepTabs; track tab.n) {
        <div [class]="'step-tab ' + stepClass(tab.n)">
          {{ tab.n }}<span class="step-lbl">. {{ tab.label }}</span>
        </div>
      }
    </div>

    @switch (store.step()) {

      @case (1) {
        <!-- Step 1 — Terms -->
        <div class="step1-layout">
          <div class="step1-form">
            <div class="card step-card">
              <div class="form-row">
                <div class="form-group">
                  <div class="form-label">Group name</div>
                  <input class="form-input" type="text" placeholder="e.g. Colony Savings"
                    [value]="store.groupName()"
                    (input)="store.groupName.set($any($event.target).value)" />
                </div>
                <div class="form-group">
                  <div class="form-label">Strategy</div>
                  <select class="form-input"
                    (change)="store.strategy.set($any($event.target).value)">
                    <option value="auction"   [selected]="store.strategy() === 'auction'">Auction</option>
                    <option value="lottery"   [selected]="store.strategy() === 'lottery'">Lottery</option>
                    <option value="fixed"     [selected]="store.strategy() === 'fixed'">Fixed order</option>
                    <option value="consensus" [selected]="store.strategy() === 'consensus'">Consensus</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <div class="form-label">Contribution (₹)</div>
                  <input class="form-input" type="number" min="1" placeholder="2000"
                    [value]="store.contributionAmount() || ''"
                    (input)="store.contributionAmount.set(+$any($event.target).value)" />
                </div>
                <div class="form-group">
                  <div class="form-label">Total members (max 15)</div>
                  <input class="form-input" type="number" min="2" max="15" placeholder="12"
                    [value]="store.totalMembers() || ''"
                    (input)="store.totalMembers.set(+$any($event.target).value)" />
                </div>
              </div>
              <div class="amber-box">
                <div class="amber-label">How many periods have already passed?</div>
                <input class="form-input" type="number" min="1"
                  style="margin-top:4px;"
                  [value]="store.periodsCompleted() || ''"
                  (input)="store.periodsCompleted.set(+$any($event.target).value)" />
                <div class="form-hint">You'll enter past payouts and contributions in the next steps</div>
              </div>
              <div class="step-footer">
                <button class="btn-sm btn-sm-p" [disabled]="!step1Valid()" (click)="next1()">
                  Next — Past payouts →
                </button>
              </div>
            </div>
          </div>

          @if (store.contributionAmount() > 0 && store.totalMembers() > 0) {
            <div class="card preview-card">
              <div class="preview-title">Live preview</div>
              <div class="preview-row">
                <span class="preview-lbl">Pot per period</span>
                <span class="preview-val">{{ fmt(store.potPeriod()) }}</span>
              </div>
              <div class="preview-row">
                <span class="preview-lbl">Periods remaining</span>
                <span class="preview-val">{{ periodsRemaining() }}</span>
              </div>
              <div class="preview-row">
                <span class="preview-lbl">Total pot value</span>
                <span class="preview-val">{{ fmt(totalExpected()) }}</span>
              </div>
            </div>
          }
        </div>
      }

      @case (2) {
        <!-- Step 2 — Past payouts -->
        <div class="card step-card">
          <div class="step-heading">Who received the pot in each past period?</div>
          <div style="display:flex;flex-direction:column;gap:8px;">
            <div class="payout-header">
              <span class="payout-head">Period</span>
              <span class="payout-head">Member who received pot</span>
              <span class="payout-head">Amount (₹)</span>
            </div>
            @for (p of store.payouts(); track $index; let i = $index) {
              <div class="payout-row">
                <span class="payout-lbl">M{{ i + 1 }}</span>
                <select class="form-input" style="padding:6px 8px;font-size:12px;"
                  (change)="store.updatePayout(i, 'memberIndex', +$any($event.target).value)">
                  @for (m of store.members(); track $index; let mi = $index) {
                    <option [value]="mi" [selected]="p.memberIndex === mi">{{ m }}</option>
                  }
                </select>
                <input class="form-input" type="number" min="0"
                  style="padding:6px 8px;font-size:12px;"
                  [value]="p.amount"
                  (input)="store.updatePayout(i, 'amount', +$any($event.target).value)" />
              </div>
            }
          </div>
          <div>
            <button class="btn-sm btn-sm-o" style="font-size:11px;" (click)="markAllPayouts()">
              Mark all as {{ fmt(store.potPeriod()) }}
            </button>
          </div>
          <div class="step-footer step-footer-sb">
            <button class="btn-sm btn-sm-o" (click)="back(1)">← Back</button>
            <button class="btn-sm btn-sm-p" [disabled]="!step2Valid()" (click)="next2()">
              Next — Contributions →
            </button>
          </div>
        </div>
      }

      @case (3) {
        <!-- Step 3 — Historical contributions -->
        <div class="card step-card">
          <div>
            <div class="step-heading">Historical contribution amounts</div>
            <div class="step-sub" style="margin-top:3px;">
              Pre-filled with {{ fmt(store.contributionAmount()) }}. Edit any that were different (partial, waived, etc.)
            </div>
          </div>

          <!-- Desktop: table -->
          <div class="contrib-desktop">
            <div class="contrib-wrap">
              <table class="contrib-tbl">
                <thead>
                  <tr>
                    <th>Member</th>
                    @for (p of store.periods(); track $index) {
                      <th>M{{ p }}</th>
                    }
                  </tr>
                </thead>
                <tbody>
                  @for (m of store.members(); track $index; let mi = $index) {
                    <tr>
                      <td>{{ m }}</td>
                      @for (p of store.periods(); track $index; let pi = $index) {
                        <td>
                          <input class="cell-input" type="number" min="0"
                            [value]="store.contributions()[mi]?.[pi] ?? 0"
                            (input)="store.updateContribution(mi, pi, +$any($event.target).value)" />
                        </td>
                      }
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

          <!-- Mobile: accordions -->
          <div class="contrib-mobile">
            @for (m of store.members(); track $index; let mi = $index) {
              <div class="acc-item">
                <div class="acc-header" (click)="toggleAccordion(mi)">
                  <span class="acc-label">{{ m }}</span>
                  <svg class="acc-chev" [class.open]="openAccordions().has(mi)" viewBox="0 0 24 24">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>
                @if (openAccordions().has(mi)) {
                  <div class="acc-body">
                    @for (p of store.periods(); track $index; let pi = $index) {
                      <div class="acc-period-row">
                        <span class="acc-period-lbl">Period M{{ p }}</span>
                        <input class="cell-input" type="number" min="0"
                          [value]="store.contributions()[mi]?.[pi] ?? 0"
                          (input)="store.updateContribution(mi, pi, +$any($event.target).value)" />
                      </div>
                    }
                  </div>
                }
              </div>
            }
          </div>

          <div>
            <button class="btn-sm btn-sm-o" style="font-size:11px;" (click)="store.markAllContributions()">
              Mark all as paid
            </button>
          </div>
          <div class="step-footer step-footer-sb">
            <button class="btn-sm btn-sm-o" (click)="back(2)">← Back</button>
            <button class="btn-sm btn-sm-p" [disabled]="!step3Valid()" (click)="next3()">
              Next — Review →
            </button>
          </div>
        </div>
      }

      @case (4) {
        <!-- Step 4 — Review -->
        <div class="card step-card">
          <div class="step-heading">Review before importing</div>
          <div style="display:flex;flex-direction:column;">
            <div class="review-row">
              <span class="review-lbl">Group</span>
              <span class="review-val">{{ store.groupName() }}</span>
            </div>
            <div class="review-row">
              <span class="review-lbl">Periods imported</span>
              <span class="review-val">{{ store.periodsCompleted() }} past periods</span>
            </div>
            <div class="review-row">
              <span class="review-lbl">Members</span>
              <span class="review-val">{{ store.totalMembers() }} members</span>
            </div>
            <div class="review-row">
              <span class="review-lbl">Total collected (historical)</span>
              <span class="review-val review-val-g">{{ fmt(store.totalCollected()) }}</span>
            </div>
            <div class="review-row">
              <span class="review-lbl">Tracking from</span>
              <span class="review-val">{{ trackingFrom() }}</span>
            </div>
          </div>
          <div class="green-box">
            ChitOS will backfill {{ store.periodsCompleted() }} past cycles as completed,
            mark {{ store.periodsCompleted() }} members as pot recipients,
            and create the active {{ trackingFrom() }} cycle for ongoing tracking.
          </div>
          <div class="step-footer step-footer-sb">
            <button class="btn-sm btn-sm-o" (click)="back(3)">← Back</button>
            <button class="btn-sm btn-sm-p" (click)="doImport()">
              @if (store.importing()) {
                <span class="spinner"></span>Importing…
              } @else {
                Import group →
              }
            </button>
          </div>
        </div>
      }

      @case (5) {
        <!-- Step 5 — Confirmed -->
        <div class="card">
          <div class="success-wrap">
            <div class="success-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                   stroke="var(--green)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div class="success-title">{{ store.groupName() }} imported!</div>
            <div class="success-sub">
              {{ store.periodsCompleted() }} past periods backfilled ·
              {{ store.totalMembers() }} members added ·
              {{ trackingFrom() }} is now active and ready for tracking.
            </div>
            <button class="btn-sm btn-sm-p" (click)="goToDashboard()">
              Go to group dashboard →
            </button>
          </div>
        </div>
      }

    }
  `,
})
export class ImportWizardPage {
  protected store = inject(ImportStore);
  private router  = inject(Router);

  openAccordions = signal<Set<number>>(new Set());

  readonly stepTabs = [
    { n: 1, label: 'Terms' },
    { n: 2, label: 'Past payouts' },
    { n: 3, label: 'Contributions' },
    { n: 4, label: 'Review' },
    { n: 5, label: 'Import' },
  ];

  step1Valid = computed(() =>
    this.store.groupName().trim().length > 0 &&
    this.store.contributionAmount() > 0 &&
    this.store.totalMembers() >= 2 &&
    this.store.totalMembers() <= 15 &&
    this.store.periodsCompleted() >= 1 &&
    this.store.periodsCompleted() < this.store.totalMembers()
  );

  step2Valid = computed(() =>
    this.store.payouts().every(p => p.amount > 0)
  );

  step3Valid = computed(() =>
    this.store.contributions().length > 0 &&
    this.store.contributions().flat().every(v => v >= 0)
  );

  periodsRemaining = computed(() =>
    Math.max(0, this.store.totalMembers() - this.store.periodsCompleted())
  );

  totalExpected = computed(() =>
    this.store.contributionAmount() * this.store.totalMembers() * this.store.totalMembers()
  );

  trackingFrom = computed(() =>
    `Period ${this.store.periodsCompleted() + 1} onwards`
  );

  stepClass(n: number): string {
    const s = this.store.step();
    if (n < s) return 'step-done';
    if (n === s) return 'step-active';
    return 'step-future';
  }

  next1() { if (!this.step1Valid()) return; this.store.initPayouts(); this.store.step.set(2); }
  next2() { if (!this.step2Valid()) return; this.store.initContributions(); this.store.step.set(3); }
  next3() { if (!this.step3Valid()) return; this.store.step.set(4); }
  back(n: 1 | 2 | 3 | 4) { this.store.step.set(n); }

  markAllPayouts() {
    const amt = this.store.potPeriod();
    this.store.payouts.update(p => p.map(row => ({ ...row, amount: amt })));
  }

  async doImport() { await this.store.doImport(); }

  goToDashboard() { this.router.navigate(['/console/dashboard']); }

  toggleAccordion(i: number) {
    this.openAccordions.update(set => {
      const next = new Set(set);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  }

  fmt(n: number): string {
    return '₹' + n.toLocaleString('en-IN');
  }
}
