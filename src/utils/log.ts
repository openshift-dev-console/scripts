function log(message?: string) {
  if (message === undefined) {
    console.log();
    return;
  }
  console.log(message.replaceAll('\n', ' ').replaceAll(/ \s+/g, ' ').trim());
}

export default log;
