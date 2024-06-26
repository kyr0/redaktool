export const cron = (task: Function, seconds: number) => {
  const interval = setInterval(task, seconds * 1000);
  return {
    runNow: () => {
      task();
    },
    stop: () => {
      clearInterval(interval);
    },
  };
};
