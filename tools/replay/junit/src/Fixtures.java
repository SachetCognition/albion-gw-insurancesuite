import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/** Synthetic beans and fixed-width helpers shared by the builder and rule tests. All values are invented. */
public final class Fixtures {
  private Fixtures() {
  }

  /** A ReplayFixtureBean from name/value pairs. */
  public static KeyableBean bean(Object... nameValues) {
    Map<String, Object> fields = new HashMap<>();
    for (int i = 0; i < nameValues.length; i += 2) {
      fields.put((String) nameValues[i], nameValues[i + 1]);
    }
    return new ReplayFixtureBean(fields);
  }

  public static BigDecimal dec(String value) {
    return new BigDecimal(value);
  }

  public static Date date(String isoDate) {
    return Date.from(LocalDate.parse(isoDate).atStartOfDay(ZoneId.systemDefault()).toInstant());
  }

  /** Text left-justified and space-padded to width (the expected value must fit). */
  public static String left(String text, int width) {
    assertTrue("expected text wider than " + width + ": " + text, text.length() <= width);
    StringBuilder sb = new StringBuilder(text);
    while (sb.length() < width) {
      sb.append(' ');
    }
    return sb.toString();
  }

  /** The expected record: the pieces concatenated and space-filled to length. */
  public static String record(int length, String... pieces) {
    return left(String.join("", pieces), length);
  }

  /** 1-based inclusive slice, as the copybook offsets are written. */
  public static String at(String record, int from, int to) {
    return record.substring(from - 1, to);
  }

  /** Asserts the record equals the golden bytes, reporting the first differing 1-based offset. */
  public static void assertRecord(String expected, String actual) {
    assertEquals("record length", expected.length(), actual.length());
    for (int i = 0; i < expected.length(); i++) {
      if (expected.charAt(i) != actual.charAt(i)) {
        fail("first difference at offset " + (i + 1) + "\nexpected [" + expected + "]\nactual   [" + actual + "]");
      }
    }
  }

  /** Runs the builder call and returns the exception it throws; fails if it returns normally. */
  public static Throwable failure(Call call) {
    try {
      Object record = call.run();
      fail("expected a failure, got [" + record + "]");
      return null;
    } catch (Throwable t) {
      if (t instanceof AssertionError) {
        throw (AssertionError) t;
      }
      return t;
    }
  }

  /** A builder call that may throw. */
  public interface Call {
    Object run() throws Throwable;
  }
}
