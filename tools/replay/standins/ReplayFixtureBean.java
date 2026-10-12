import java.util.Map;

/** One fixture row as a KeyableBean for the offline replay: getFieldValue reads the row's column values. */
public final class ReplayFixtureBean implements KeyableBean {
  private final Map<String, Object> fields;

  public ReplayFixtureBean(Map<String, Object> fields) {
    this.fields = fields;
  }

  public Object getFieldValue(String name) {
    return fields.get(name);
  }
}
