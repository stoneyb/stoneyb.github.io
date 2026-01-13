/* ========================================
   HIDDEN COMMANDS
   Secret link commands
   ======================================== */

function registerHiddenCommands(registry) {
  registry.register(
    "dn",
    (args, terminal) => {
      window.open("https://dn-clicker2.vercel.app", "_blank");
    },
    {
      description: "",
      hidden: true,
    }
  );

  registry.register(
    "chumley",
    (args, terminal) => {
      window.open("https://op.gg/lol/summoners/na/chumley420-NA1", "_blank");
    },
    {
      description: "",
      hidden: true,
    }
  );

  registry.register(
    "empatheticrock",
    (args, terminal) => {
      window.open(
        "https://op.gg/lol/summoners/na/EmpatheticRock-NA1",
        "_blank"
      );
    },
    {
      description: "",
      hidden: true,
    }
  );

  registry.register(
    "masedawg",
    (args, terminal) => {
      window.open("https://op.gg/lol/summoners/na/masedawg69-NA1", "_blank");
    },
    {
      description: "",
      hidden: true,
    }
  );
}

window.registerHiddenCommands = registerHiddenCommands;
