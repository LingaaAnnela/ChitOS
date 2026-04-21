import { Injectable, computed, signal } from '@angular/core';

@Injectable()
export class ImportStore {
  step = signal<1 | 2 | 3 | 4 | 5>(1);

  groupName          = signal('');
  strategy           = signal('auction');
  contributionAmount = signal(0);
  totalMembers       = signal(0);
  periodsCompleted   = signal(0);

  payouts       = signal<Array<{ memberIndex: number; amount: number }>>([]);
  contributions = signal<number[][]>([]);

  importing = signal(false);

  members   = computed(() => Array.from({ length: this.totalMembers() }, (_, i) => `Member ${i + 1}`));
  periods   = computed(() => Array.from({ length: this.periodsCompleted() }, (_, i) => i + 1));
  potPeriod = computed(() => this.contributionAmount() * this.totalMembers());

  totalCollected = computed(() =>
    this.contributions().flat().reduce((s, v) => s + (v || 0), 0)
  );

  initPayouts() {
    this.payouts.set(
      Array.from({ length: this.periodsCompleted() }, () => ({
        memberIndex: 0,
        amount: this.potPeriod(),
      }))
    );
  }

  initContributions() {
    const amt = this.contributionAmount();
    this.contributions.set(
      Array.from({ length: this.totalMembers() }, () =>
        Array(this.periodsCompleted()).fill(amt)
      )
    );
  }

  updatePayout(i: number, field: 'memberIndex' | 'amount', val: number) {
    this.payouts.update(p => {
      const copy = [...p];
      copy[i] = { ...copy[i], [field]: val };
      return copy;
    });
  }

  updateContribution(mi: number, pi: number, val: number) {
    this.contributions.update(c => {
      const copy = c.map(row => [...row]);
      copy[mi][pi] = val;
      return copy;
    });
  }

  markAllContributions() {
    const amt = this.contributionAmount();
    this.contributions.update(c => c.map(row => row.map(() => amt)));
  }

  async doImport() {
    this.importing.set(true);
    await new Promise(r => setTimeout(r, 500));
    this.importing.set(false);
    this.step.set(5);
  }
}
