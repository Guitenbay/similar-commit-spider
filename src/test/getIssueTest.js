
const issues = [];
"Fix Bugs #123 #2 # ".replace(/(#\d+)/g, (_, p1) => {
  // console.log(match);
  issues.push(p1);
  return p1;
})

console.log("expect: [#123, #2]")
console.log(issues);
