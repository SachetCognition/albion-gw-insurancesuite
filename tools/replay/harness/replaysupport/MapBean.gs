package replaysupport

uses java.util.LinkedHashMap
uses java.util.Map

/*
 * MapBean - offline-replay KeyableBean backed by a map, mirroring how the committed
 * characterization tests hydrate builder inputs (EasyMock field stubs). A missing key
 * behaves exactly like a null field on a half-hydrated POLARIS row.
 */
class MapBean implements KeyableBean {

  var _fields : Map<String, Object>

  construct() {
    _fields = new LinkedHashMap<String, Object>()
  }

  construct(fields : Map<String, Object>) {
    _fields = fields
  }

  override function getFieldValue(field : String) : Object {
    return _fields.get(field)
  }

  function set(field : String, value : Object) : MapBean {
    _fields.put(field, value)
    return this
  }
}
