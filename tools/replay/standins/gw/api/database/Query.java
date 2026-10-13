package gw.api.database;

/**
 * Offline replay stand-in: PolicyCenter rule classes import gw.api.database.Query without calling it on the replayed
 * path, and the import must resolve for the class to load. Never on a centre classpath and not a Guidewire artifact.
 */
public final class Query {
  private Query() {
  }
}
