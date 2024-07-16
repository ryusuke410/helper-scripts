import { cd, $, chalk } from "zx";
import { z } from "zod";

const init = () => {
  const verbose = $.verbose;
  $.verbose = false;

  // レポジトリのルートディレクトリに移動
  cd("..");

  // npm を呼ぶ場合に邪魔になるので、環境変数 NODE_ENV をリセットする
  process.env.NODE_ENV = undefined;

  $.verbose = verbose;
}

const helpAndExample = async () => {
  console.log("使い方:");
  console.log("  ./m                # 最初に試す");
  console.log("  ./m hello <name>   # Hello, <name> を表示");
  console.log("  ./m bun <command>  # m-scripts の中で bun コマンドを実行");
  console.log("例:")
  console.log(chalk.blue("  ./m hello world"));
  console.log(chalk.blue("  ./m bun --version"));
  console.log();

  console.log("🚀 Start m script\n");
  console.log(`以下の処理は、 ${chalk.blue("m-scripts/lib/m.ts")} に実装されています。`);
  // 以下、スクリプトのサンプル

  // Hello World
  await $`echo "Hello, world!"`;
  console.log();

  // 標準出力等をコード内で利用する必要がない場合は、inherit を指定するのがオススメ
  await $`command ls`.stdio("inherit", "inherit", "inherit");
  console.log();

  // inherit しないと、表示が崩れるなどしやすい
  await $`command ls`;
  console.log();

  // quiet も追加で指定すると、実行コマンドの表示が抑制されて便利
  console.log("current directory:");
  await $`pwd`.stdio("inherit", "inherit", "inherit").quiet();
  console.log();

  // 引数を表示
  console.log("argv:");
  for (const arg of process.argv) {
    console.log(`- ${arg}`);
  }
  console.log();

  const npmLsResult = await $`cd m-scripts && npm ls --json`.quiet();
  const packageInfoUnsafe = JSON.parse(npmLsResult.stdout);
  const packageInfo = z.object({
    name: z.string(),
    version: z.string(),
  }).parse(packageInfoUnsafe);
  console.log("package:");
  console.log(`  name: ${packageInfo.name}`);
  console.log(`  version: ${packageInfo.version}`);
}

const hello = (name: string) => {
  console.log(`Hello, ${name}!`);
}

(async () => {
  init();

  const command = process.argv[2];
  if (command === "hello") {
    hello(process.argv[3]);
  } else if (command === "bun") {
    // command に bun が指定された場合、m スクリプトの中で bun コマンドを実行する。
    // よって、そもそも m.ts が呼ばれることはない。
    throw new Error("never happen");
  } else {
    await helpAndExample();
  }
})();
