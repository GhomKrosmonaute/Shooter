const gulp = require("gulp")
const esbuild = require("gulp-esbuild")

function bundle() {
  return gulp
    .src("./src/index.ts")
    .pipe(
      esbuild({
        outfile: "bundle.js",
        bundle: true,
        target: ["chrome58", "firefox57", "safari11", "edge16"],
        loader: {
          ".ts": "ts",
          ".json": "json",
        },
      })
    )
    .pipe(gulp.dest("./dist/"))
}

exports.bundle = bundle
