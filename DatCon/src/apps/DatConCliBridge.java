package src.apps;

import java.io.File;
import java.io.PrintWriter;
import java.io.PrintStream;
import java.io.StringWriter;

import src.Files.AnalyzeDatResults;
import src.Files.ConvertDat;
import src.Files.CsvWriter;
import src.Files.DatFile;
import src.Files.DatConLog;
import src.Files.NotDatFile;
import src.Files.Persist;

public class DatConCliBridge {

    private static String esc(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("\\", "\\\\").replace("\"", "\\\"")
                .replace("\r", " ").replace("\n", " ");
    }

    private static String jsonError(String message) {
        return "{\"success\":false,\"error\":\"" + esc(message) + "\"}";
    }

    private static String jsonErrorDetailed(String message, Exception e) {
        StringBuilder sb = new StringBuilder();
        sb.append("{\"success\":false");
        sb.append(",\"error\":\"").append(esc(message)).append("\"");
        if (e != null) {
            StackTraceElement[] stack = e.getStackTrace();
            if (stack != null && stack.length > 0) {
                StackTraceElement top = stack[0];
                sb.append(",\"location\":\"")
                        .append(esc(top.getClassName() + "." + top.getMethodName() + ":" + top.getLineNumber()))
                        .append("\"");
            }
            StringWriter sw = new StringWriter();
            PrintWriter pw = new PrintWriter(sw);
            e.printStackTrace(pw);
            pw.flush();
            sb.append(",\"stack\":\"").append(esc(sw.toString())).append("\"");
        }
        sb.append("}");
        return sb.toString();
    }

    private static void initializeRuntime() {
        // Match DatCon startup defaults for parsing behavior and persistence-backed settings.
        new Persist();
        try {
            new DatConLog();
        } catch (Throwable ignored) {
            // Logging is optional for bridge mode; continue even if log file initialization fails.
        }
    }

    private static String jsonAnalyze(DatFile datFile, AnalyzeDatResults results) {
        long lowestTick = datFile.lowestTickNo;
        long highestTick = datFile.highestTickNo;
        boolean hasTicks = lowestTick >= 0 && highestTick >= 0;

        StringBuilder sb = new StringBuilder();
        sb.append("{\"success\":true,\"data\":{");
        sb.append("\"acType\":\"").append(esc(datFile.getACTypeString())).append("\",");
        sb.append("\"clockRate\":").append(datFile.getClockRate()).append(",");
        sb.append("\"gpsLocked\":").append(datFile.gpsLockTick >= 0).append(",");
        sb.append("\"firstMotorTick\":").append(datFile.firstMotorStartTick).append(",");
        sb.append("\"lastMotorTick\":").append(datFile.lastMotorStopTick).append(",");
        sb.append("\"lowestTick\":").append(hasTicks ? lowestTick : 0).append(",");
        sb.append("\"highestTick\":").append(hasTicks ? highestTick : 0).append(",");
        sb.append("\"analysisMessage\":\"").append(esc(results.toString())).append("\"");
        sb.append("}}");
        return sb.toString();
    }

    private static String getBaseName(File datFile) {
        String fileName = datFile.getName();
        int dot = fileName.lastIndexOf('.');
        if (dot > 0) {
            return fileName.substring(0, dot);
        }
        return fileName;
    }

    private static void writeKmlPrelude(PrintStream kmlPS, String kmlFileName, ConvertDat.KmlType kmlType) {
        String kmlFileNameRoot = kmlFileName;
        int dot = kmlFileName.lastIndexOf('.');
        if (dot > 0) {
            kmlFileNameRoot = kmlFileName.substring(0, dot);
        }

        kmlPS.print("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
                + " <kml xmlns=\"http://www.opengis.net/kml/2.2\">\n"
                + "  <Document>\n" + "   <name>" + kmlFileNameRoot + "</name>\n"
                + "    <description>DatKML</description>\n"
                + "     <Style id=\"red\">\n" + "      <LineStyle>\n"
                + "       <color>ff0000ff</color>\n"
                + "       <width>3</width>\n" + "      </LineStyle>\n"
                + "      </Style>\n" + "     <Style id=\"green\">\n"
                + "      <LineStyle>\n" + "       <color>ff00ff00</color>\n"
                + "       <width>3</width>\n" + "      </LineStyle>\n"
                + "      </Style>\n" + "     <Style id=\"blue\">\n"
                + "      <LineStyle>\n" + "       <color>ffff0000</color>\n"
                + "       <width>3</width>\n" + "      </LineStyle>\n"
                + "      </Style>\n");
        kmlPS.print(
                "       <Placemark>\n" + "         <styleUrl>#red</styleUrl>\n"
                        + "          <LineString>\n");
        if (kmlType == ConvertDat.KmlType.GROUNDTRACK) {
            kmlPS.print("           <tessellate>1</tessellate>\n");
        } else if (kmlType == ConvertDat.KmlType.PROFILE) {
            kmlPS.print("           <altitudeMode>absolute</altitudeMode>\n");
        }
        kmlPS.print("            <coordinates>\n");
    }

    private static void writeKmlFinal(PrintStream kmlPS) {
        kmlPS.print("       </coordinates>\n" + "    </LineString>\n"
                + "  </Placemark>\n");
        kmlPS.print(" </Document>\n" + "</kml>\n");
    }

    private static ConvertDat prepareConvertDat(String datPath)
            throws Exception {
        DatFile datFile = DatFile.createDatFile(datPath);
        if (datFile == null) {
            throw new IllegalStateException("Unable to open DAT file: " + datPath);
        }
        datFile.preAnalyze();
        ConvertDat convertDat = datFile.createConVertDat();
        if (convertDat == null) {
            datFile.close();
            throw new IllegalStateException("Unable to create converter for DAT file: " + datPath);
        }
        convertDat.createRecordParsers();
        return convertDat;
    }

    private static String runAnalyze(String datPath) throws Exception {
        ConvertDat convertDat = prepareConvertDat(datPath);
        DatFile datFile = convertDat.getDatFile();
        try {
            AnalyzeDatResults results = convertDat.analyze(false);
            return jsonAnalyze(datFile, results);
        } finally {
            if (datFile != null) {
                datFile.close();
            }
        }
    }

    private static String runExportCsv(String datPath, String outDir) throws Exception {
        ConvertDat convertDat = prepareConvertDat(datPath);
        DatFile datFile = convertDat.getDatFile();
        CsvWriter writer = null;
        try {
            String baseName = getBaseName(new File(datPath));
            File outputFile = new File(outDir, baseName + ".csv");
            writer = new CsvWriter(outputFile.getAbsolutePath());
            convertDat.csvWriter = writer;
            convertDat.analyze(false);
            return "{\"success\":true,\"path\":\"" + esc(outputFile.getAbsolutePath()) + "\"}";
        } finally {
            if (writer != null) {
                try {
                    writer.close();
                } catch (Exception ignored) {
                }
            }
            if (datFile != null) {
                datFile.close();
            }
        }
    }

        private static String runExportKml(String datPath, String outDir, String kmlMode,
            String homePointElevationArg)
            throws Exception {
        ConvertDat convertDat = prepareConvertDat(datPath);
        DatFile datFile = convertDat.getDatFile();
        PrintStream kmlPS = null;
        try {
            String baseName = getBaseName(new File(datPath));
            File outputFile = new File(outDir, baseName + ".kml");
            convertDat.kmlType = "profile".equalsIgnoreCase(kmlMode)
                    ? ConvertDat.KmlType.PROFILE
                    : ConvertDat.KmlType.GROUNDTRACK;

            if (convertDat.kmlType == ConvertDat.KmlType.PROFILE) {
                if (homePointElevationArg == null || homePointElevationArg.trim().isEmpty()) {
                    throw new IllegalArgumentException(
                            "Profile 3D requires home point elevation in meters");
                }
                double homePointElevation = Double.parseDouble(homePointElevationArg.trim());
                convertDat.homePointElevation = homePointElevation;
                convertDat.setTakeOffAlt(homePointElevation);
            }

            convertDat.kmlFileName = outputFile.getName();
            kmlPS = new PrintStream(outputFile);
            convertDat.kmlPS = kmlPS;

            writeKmlPrelude(kmlPS, outputFile.getName(), convertDat.kmlType);
            convertDat.analyze(false);
            writeKmlFinal(kmlPS);

            return "{\"success\":true,\"path\":\"" + esc(outputFile.getAbsolutePath()) + "\"}";
        } finally {
            if (kmlPS != null) {
                try {
                    kmlPS.close();
                } catch (Exception ignored) {
                }
            }
            if (datFile != null) {
                datFile.close();
            }
        }
    }

    public static void main(String[] args) {
        initializeRuntime();

        if (args.length < 2) {
            System.out.println(jsonError("Usage: analyze|export-csv|export-kml <datPath> [outDir] [kmlMode] [homePointElevationMeters]"));
            System.exit(1);
            return;
        }

        String command = args[0];
        String datPath = args[1];

        try {
            File datFile = new File(datPath);
            if (!datFile.exists()) {
                System.out.println(jsonError("DAT file not found: " + datPath));
                System.exit(2);
                return;
            }

            String response;
            if ("analyze".equalsIgnoreCase(command)) {
                response = runAnalyze(datPath);
            } else if ("export-csv".equalsIgnoreCase(command)) {
                String outDir = args.length >= 3 ? args[2] : datFile.getParent();
                response = runExportCsv(datPath, outDir);
            } else if ("export-kml".equalsIgnoreCase(command)) {
                String outDir = args.length >= 3 ? args[2] : datFile.getParent();
                String mode = args.length >= 4 ? args[3] : "groundtrack";
                String homePointElevationArg = args.length >= 5 ? args[4] : null;
                response = runExportKml(datPath, outDir, mode, homePointElevationArg);
            } else {
                response = jsonError("Unknown command: " + command);
                System.out.println(response);
                System.exit(3);
                return;
            }

            System.out.println(response);
        } catch (NotDatFile e) {
            System.out.println(jsonError("Not a valid DAT file"));
            System.exit(4);
        } catch (Exception e) {
            String message = e.getMessage() != null ? e.getMessage() : e.toString();
            System.out.println(jsonErrorDetailed(message, e));
            System.exit(5);
        }
    }
}
