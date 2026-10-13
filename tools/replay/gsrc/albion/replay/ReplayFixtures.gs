package albion.replay

uses java.io.File
uses java.math.BigDecimal
uses java.nio.file.Files
uses java.text.SimpleDateFormat
uses java.util.ArrayList
uses java.util.HashMap
uses java.util.List
uses java.util.Map

/*******************************************************************************
 * ReplayFixtures
 *
 * Reads a tools/replay/fixtures CSV file: one row per case, case_id,expect,<Column>:<type>,... with # comment lines and
 * ~ for null. Column types (tools/replay/README.md):
 *   text     String
 *   decimal  java.math.BigDecimal
 *   date     java.util.Date, yyyy-MM-dd
 *   integer  java.lang.Integer
 *   bit      true / false as java.lang.Boolean; any other value is kept as the String (POLARIS-hydrated flags)
 *   expect   an expected value for the harness, not a bean field
 * A row whose case_id starts with null_bean is replayed with a null bean; its field columns must all be ~.
 * Replay tooling only; never on a centre classpath.
 *
 * CHANGE HISTORY (append only - audit requirement AGI-GRC-114):
 *  13/10/2026   AGI-GW Platform  Created; shared by the offline replay harnesses
 ******************************************************************************/
class ReplayFixtures {

  public static final var NULL_BEAN_PREFIX : String = "null_bean"

  private construct() {
  }

  static function read(fixture : File) : List<ReplayRow> {
    var lines = Files.readAllLines(fixture.toPath()).where(\ l -> l.trim().length() > 0 and not l.startsWith("#"))
    var header = lines.first().split(",")
    var rows = new ArrayList<ReplayRow>()
    for (line in lines.subList(1, lines.size())) {
      var cols = line.split(",", -1)
      if (cols.length != header.length) {
        throw new IllegalStateException(fixture.Name + ": wrong column count in " + line)
      }
      var fields = new HashMap<String, Object>()
      var expected = new HashMap<String, String>()
      var nullBean = cols[0].startsWith(NULL_BEAN_PREFIX)
      for (i in 2..|header.length) {
        var spec = header[i].split(":")
        if (spec[1] == "expect") {
          expected.put(spec[0], cols[i] == "~" ? null : cols[i])
        } else {
          if (nullBean and cols[i] != "~") {
            throw new IllegalStateException(fixture.Name + ": null-bean row " + cols[0] + " sets " + spec[0])
          }
          fields.put(spec[0], parse(cols[i], spec[1]))
        }
      }
      var fieldMap : Map<String, Object> = fields
      var expectedMap : Map<String, String> = expected
      rows.add(new ReplayRow(cols[0], cols[1], fieldMap, expectedMap, nullBean))
    }
    return rows
  }

  static function parse(value : String, kind : String) : Object {
    if (value == "~") {
      return null
    }
    switch (kind) {
      case "text": return value
      case "decimal": return new BigDecimal(value)
      case "date": return new SimpleDateFormat("yyyy-MM-dd").parse(value)
      case "integer": return Integer.valueOf(value)
      case "bit": return value == "true" ? Boolean.TRUE : (value == "false" ? Boolean.FALSE : value)
    }
    throw new IllegalArgumentException("unknown column type " + kind)
  }

  /** Builder or rule type by name; fails with the missing name when the class is not on the replay classpath. */
  static function classNamed(name : String) : gw.lang.reflect.IType {
    var t = gw.lang.reflect.TypeSystem.getByFullNameIfValid(name)
    if (t == null) {
      throw new IllegalStateException("replay class " + name + " is not on the replay classpath")
    }
    return t
  }

  /** Calls a static one-argument (KeyableBean) function, rethrowing the builder's own exception. */
  static function invoke(type : gw.lang.reflect.IType, method : String, bean : KeyableBean) : Object {
    var m = type.TypeInfo.getMethod(method, {KeyableBean})
    if (m == null) {
      throw new IllegalStateException(type.Name + "." + method + "(KeyableBean) not found")
    }
    try {
      return m.CallHandler.handleCall(null, {bean})
    } catch (e : java.lang.Throwable) {
      var cause = e
      while ((cause typeis java.lang.reflect.InvocationTargetException or cause.Class == java.lang.RuntimeException) and cause.Cause != null) {
        cause = cause.Cause
      }
      throw cause
    }
  }

  /** "!" + exception class name when the call fails, else null. */
  static function failureOf(type : gw.lang.reflect.IType, method : String, bean : KeyableBean) : String {
    try {
      invoke(type, method, bean)
      return null
    } catch (e : java.lang.Throwable) {
      return "!" + e.Class.Name
    }
  }
}
