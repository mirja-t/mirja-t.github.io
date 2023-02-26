export function debounce(func, timeout = 300){
    let timer;
    return (...args) => {
      clearTimeout(timer);
      if(!func) return;
      timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}