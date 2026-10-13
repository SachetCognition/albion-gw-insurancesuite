import gw.config.CommonServices;
import gw.fs.IDirectory;
import gw.lang.Gosu;
import gw.lang.reflect.IType;
import gw.lang.reflect.TypeSystem;
import gw.lang.reflect.gs.IGosuClass;
import java.io.File;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;

/**
 * Boots the open-source Gosu 1.17.5 runtime once per JVM on the source directories named by the system property
 * {@code replay.gosu.classpath} (path-separator separated, set by run_junit.sh to one centre's gsrc) and calls static
 * Gosu functions taking a KeyableBean. Exceptions thrown by the Gosu code are rethrown unwrapped.
 */
public final class GosuRuntime {
  private static boolean booted;

  private GosuRuntime() {
  }

  public static synchronized void boot() {
    if (booted) {
      return;
    }
    String classpath = System.getProperty("replay.gosu.classpath");
    if (classpath == null || classpath.isEmpty()) {
      throw new IllegalStateException("system property replay.gosu.classpath is not set (run through run_junit.sh)");
    }
    List<IDirectory> dirs = new ArrayList<>();
    for (String dir : classpath.split(File.pathSeparator)) {
      dirs.add(CommonServices.getFileSystem().getIDirectory(new File(dir)));
    }
    Gosu.init();
    Gosu.setClasspath(dirs);
    booted = true;
  }

  /** The compiled Java class behind a Gosu type; fails when the type is missing or does not compile. */
  public static Class<?> gosuClass(String name) {
    boot();
    IType type = TypeSystem.getByFullNameIfValid(name);
    if (!(type instanceof IGosuClass)) {
      throw new IllegalStateException("Gosu class " + name + " is not on the replay classpath");
    }
    IGosuClass gosu = (IGosuClass) type;
    if (!gosu.isValid()) {
      throw new IllegalStateException("Gosu class " + name + " does not compile: " + gosu.getParseResultsException());
    }
    return gosu.getBackingClass();
  }

  /** Calls the static function {@code name.method(KeyableBean)}. */
  public static Object call(String name, String method, KeyableBean bean) throws Throwable {
    Method m = gosuClass(name).getMethod(method, KeyableBean.class);
    try {
      return m.invoke(null, bean);
    } catch (InvocationTargetException e) {
      throw e.getCause();
    }
  }

  /** Reads a static field (any visibility) of a Gosu class. */
  public static Object staticField(String name, String field) throws ReflectiveOperationException {
    java.lang.reflect.Field f = gosuClass(name).getDeclaredField(field);
    f.setAccessible(true);
    return f.get(null);
  }
}
