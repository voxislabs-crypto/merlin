{ pkgs }: {
  deps = [
    pkgs.nodejs_20
    pkgs.python3
    pkgs.prisma-engines
  ];
  env = {
    PRISMA_QUERY_ENGINE_LIBRARY = "${pkgs.prisma-engines}/lib/libquery_engine.node";
    PRISMA_SCHEMA_ENGINE_BINARY = "${pkgs.prisma-engines}/bin/schema-engine";
  };
}