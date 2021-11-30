/* jshint esversion: 10 */
import "./styles.css";
import amp from "./amp.js";
//
const cl = (...args) => console.log(...args);
//
const myMath = function myMath() {};
amp(myMath);
const even = (v) => Number.isSafeInteger(v) && v % 2 === 0;
myMath.quick("even", even);
const arr = [1, 2, "x", [], 3, 4, {}, 5, "y", 6];
const r = myMath.quickEven(arr);
