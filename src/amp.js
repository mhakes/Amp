/* jshint esversion: 10 */
const cast = (...args) => {
  return Array.isArray(args[0]) && args.length === 1 ? args[0] : args;
};
const toCamelCase = str => {
  const s =
    str &&
    str
      .match(
        /[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g
      )
      .map(x => x.slice(0, 1).toUpperCase() + x.slice(1).toLowerCase())
      .join('');
  return s.slice(0, 1).toLowerCase() + s.slice(1);
};
//
const makeName = (cTor) => {
  const method = toCamelCase(cTor);
  if (cTor.startsWith("HTML")) return [method, cTor];
  return [method, method.charAt(0).toUpperCase() + method.slice(1)];
};
const sourcesAndTargets = (...args) => {
  const targets = [...cast(...args)];
  return [targets.shift(), cast(...targets)];
};
const pick = (obj, ...keys) => {
  return cast(...keys).reduce((acc, key) => {
    if (key in obj) acc[key] = obj[key];
    return acc;
  }, {});
};
//
const yeah = ["all", "any", "are", "indexesAre", "qty", "first", "last", "firstIndex", "lastIndex"];
const nay = ["notAll", "notAny", "areNot", "indexesNot", "qtyNot", "firstNot", "lastNot", "firstIndexNot", "lastIndexNot"];
const quickMethods = ["method", "any", "are", "first", "last", "qty", "qtyNot"];
const allMethods = ["section", "quick", ...yeah, ...nay, "toto"];
//
export default function amp(master, withAmp = false) {
  function valuesMethod(toto, upper) {
    master[`values${upper}`] = (keys, ...args) => pick(toto(...args), keys);
    master[`method${upper}`] = (...keys) => {
      const k = cast(...keys);
      return (...args) => pick(toto(...args), k);
    };
  }
  function factory({ fn, method, upper, asST }) {
    let source, targets;
    const res = (target) => asST ? fn(source, target) : fn(target);
    const forge = (m, ...args) => {
      if (asST) {
        [source, targets] = sourcesAndTargets(...args);
      } else {
        targets = cast(...args);
      }
      const u = {
        method,
        are: [],
        indexesAre: [],
        areNot: [],
        indexesNot: []
      };
      targets.forEach((target, index) => {
        if (res(target)) {
          u.are.push(target);
          u.indexesAre.push(index);
        } else {
          u.areNot.push(target);
          u.indexesNot.push(index);
        }
      });
      u.section = [u.are, u.areNot];
      u.qty = u.indexesAre.length;
      u.qtyNot = u.indexesNot.length;
      u.any = u.qty > 0;
      u.first = u.are[0];
      u.last = u.are[u.qty - 1];
      u.quick = pick(u, quickMethods);
      if (m in u) return u[m];
      u.all = u.qtyNot === 0;
      u.notAny = u.qty === 0;
      u.notAll = u.qtyNot > 0;
      u.firstNot = u.areNot[0];
      u.lastNot = u.areNot[u.qtyNot - 1];
      if (m in u) return u[m];
      if (u.any) {
        u.firstIndex = u.indexesAre[0];
        u.lastIndex = u.indexesAre[u.qty - 1];
      } else {
        u.firstIndex = -1;
        u.lastIndex = -1;
      }
      if (u.notAll) {
        u.firstIndexNot = u.indexesNot[0];
        u.lastIndexNot = u.indexesNot[u.qtyNot - 1];
      } else {
        u.firstIndexNot = -1;
        u.lastIndexNot = -1;
      }
      if (m === "toto") return u;
      return u[m];
      //
    };
    //
    allMethods.forEach((m) => {
      master[`${m}${upper}`] = (...args) => forge(m, ...args);
    });
    valuesMethod(master[`toto${upper}`], upper);
  }
  const yn = (cTor, fn) => {
    const [method, upper] = makeName(cTor);
    master[method] = fn;
    master[`not${upper}`] = (...args) => !fn(...args);
    return [method, upper];
  };
  const quick = (cTor, fn, asST = false) => {
    const [method, upper] = yn(cTor, fn);
    let source, targets;
    const qm = [...quickMethods, "quick"];
    const res = (target) => asST ? fn(source, target) : fn(target);
    const oven = (m, ...args) => {
      if (asST) {
        [source, targets] = sourcesAndTargets(...args);
      } else {
        targets = cast(...args);
      }
      const u = { method };
      u.are = targets.filter(res);
      u.qty = u.are.length;
      u.any = u.qty > 0;
      u.first = u.are[0];
      u.last = u.are[u.qty - 1];
      u.qtyNot = targets.lenth = u.qty;
      if (m === "quick") return u;
      return u[m];
    };
    qm.forEach((m) => {
      master[`${m}${upper}`] = (...args) => oven(m, ...args);
    });
  };
  //
  const extend = (cTor, fn, asST = false) => {
    const [method, upper] = yn(cTor, fn);
    factory({ fn, method, upper, asST });
  };
  //
  if (withAmp) {
    master.amp = function () { };
    master.amp.yn = yn;
    master.amp.quick = quick;
    master.amp.extend = extend;
  } else {
    master.yn = yn;
    master.quick = quick;
    master.extend = extend;
  }
  return master;
}
