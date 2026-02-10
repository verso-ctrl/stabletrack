import { toast, subscribeToToasts, showError, showDemoMessage } from '../toast';

describe('subscribeToToasts', () => {
  it('receives emitted toasts', () => {
    const received: any[] = [];
    const unsubscribe = subscribeToToasts((t) => received.push(t));

    toast.success('Test', 'message');

    expect(received).toHaveLength(1);
    expect(received[0].type).toBe('success');
    expect(received[0].title).toBe('Test');
    expect(received[0].message).toBe('message');

    unsubscribe();
  });

  it('unsubscribe stops receiving toasts', () => {
    const received: any[] = [];
    const unsubscribe = subscribeToToasts((t) => received.push(t));

    toast.success('Before');
    unsubscribe();
    toast.success('After');

    expect(received).toHaveLength(1);
    expect(received[0].title).toBe('Before');
  });
});

describe('toast methods', () => {
  afterEach(() => {
    // Clean up any lingering subscriptions by not keeping them
  });

  it('toast.success emits success type', () => {
    const received: any[] = [];
    const unsubscribe = subscribeToToasts((t) => received.push(t));

    toast.success('Done', 'It worked');

    expect(received[0].type).toBe('success');
    expect(received[0].title).toBe('Done');
    expect(received[0].message).toBe('It worked');
    expect(received[0].id).toBeDefined();

    unsubscribe();
  });

  it('toast.error emits error type', () => {
    const received: any[] = [];
    const unsubscribe = subscribeToToasts((t) => received.push(t));

    toast.error('Failed', 'Something broke');

    expect(received[0].type).toBe('error');
    expect(received[0].title).toBe('Failed');

    unsubscribe();
  });

  it('toast.warning emits warning type', () => {
    const received: any[] = [];
    const unsubscribe = subscribeToToasts((t) => received.push(t));

    toast.warning('Heads up');

    expect(received[0].type).toBe('warning');
    expect(received[0].title).toBe('Heads up');

    unsubscribe();
  });

  it('toast.info emits info type', () => {
    const received: any[] = [];
    const unsubscribe = subscribeToToasts((t) => received.push(t));

    toast.info('FYI', 'Info here');

    expect(received[0].type).toBe('info');
    expect(received[0].title).toBe('FYI');

    unsubscribe();
  });

  it('returns a unique id', () => {
    const id1 = toast.success('A');
    const id2 = toast.success('B');
    expect(id1).not.toBe(id2);
  });
});

describe('showError', () => {
  it('extracts Error message', () => {
    const received: any[] = [];
    const unsubscribe = subscribeToToasts((t) => received.push(t));

    showError(new Error('Something failed'));

    expect(received[0].type).toBe('error');
    expect(received[0].title).toBe('Error');
    expect(received[0].message).toBe('Something failed');

    unsubscribe();
  });

  it('falls back to default message for non-Error', () => {
    const received: any[] = [];
    const unsubscribe = subscribeToToasts((t) => received.push(t));

    showError('just a string', 'Fallback msg');

    expect(received[0].message).toBe('Fallback msg');

    unsubscribe();
  });

  it('uses default fallback when no fallback provided', () => {
    const received: any[] = [];
    const unsubscribe = subscribeToToasts((t) => received.push(t));

    showError(42);

    expect(received[0].message).toBe('An error occurred');

    unsubscribe();
  });
});

describe('showDemoMessage', () => {
  it('emits info toast with correct content', () => {
    const received: any[] = [];
    const unsubscribe = subscribeToToasts((t) => received.push(t));

    showDemoMessage('Password change');

    expect(received[0].type).toBe('info');
    expect(received[0].title).toBe('Demo Mode');
    expect(received[0].message).toBe('Password change is disabled in demo mode.');

    unsubscribe();
  });
});
