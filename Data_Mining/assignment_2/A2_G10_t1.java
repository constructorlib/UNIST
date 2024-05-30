import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Random;
import java.util.Objects;
import java.awt.geom.Point2D;


class ClusterUtils {

    public static Point calculateCentroid(List<Point> cluster) {
        double sumX = 0, sumY = 0;
        for (Point p : cluster) {
            sumX += p.x;
            sumY += p.y;
        }
        return new Point(null, sumX / cluster.size(), sumY / cluster.size());
    }

    public static double calculateSSE(List<List<Point>> clusters) {
        double sse = 0;
        for (List<Point> cluster : clusters) {
            Point centroid = calculateCentroid(cluster);

            for (Point point : cluster) {
                sse += Math.pow(point.x - centroid.x, 2) + Math.pow(point.y - centroid.y, 2);
            }
        }
        return sse;
    }
}

class Point {
    String id;
    double x;
    double y;

    Point(String id, double x, double y) {
        this.id = id;
        this.x = x;
        this.y = y;
    }

    // Override equals and hashCode for comparison purposes
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        Point point = (Point) obj;
        return Double.compare(point.x, x) == 0 &&
               Double.compare(point.y, y) == 0;
    }

    @Override
    public int hashCode() {
        return Objects.hash(x, y);
    }


    // Custom comparator to sort points based on the numerical part of ID
    public static Comparator<Point> idComparator = new Comparator<Point>() {
        @Override
        public int compare(Point p1, Point p2) {
            // Extract numerical part of ID
            int num1 = Integer.parseInt(p1.id.substring(1));
            int num2 = Integer.parseInt(p2.id.substring(1));
            return Integer.compare(num1, num2);
        }
    };

}

class KMeans {
    private int k;
    private List<Point> centroids;
    private List<List<Point>> clusters;
    private static final int MAX_ITERATIONS = 1000;  // Maximum number of iterations

    public KMeans(int k) {
        this.k = k;
        this.centroids = new ArrayList<>();
        this.clusters = new ArrayList<>();
        
    }

    public double euclideanDistance(Point p1, Point p2) {
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    }


    public void fit(List<Point> points) {
        Random rand = new Random();
        Collections.shuffle(points, rand);

        for (int i = 0; i < k; i++) {
            centroids.add(points.get(i));
            clusters.add(new ArrayList<>());
        }

        boolean changed;
        int iterations = 0;

        do {
            for (List<Point> cluster : clusters) {
                cluster.clear();
            }

            for (Point point : points) {
                int nearestCentroid = -1;
                double minDistance = Double.MAX_VALUE;

                for (int i = 0; i < k; i++) {
                    double distance = euclideanDistance(point, centroids.get(i));
                    if (distance < minDistance) {
                        minDistance = distance;
                        nearestCentroid = i;
                    }
                }
                clusters.get(nearestCentroid).add(point);
            }

            changed = false;
            for (int i = 0; i < k; i++) {
                Point newCentroid = ClusterUtils.calculateCentroid(clusters.get(i));
                if (!newCentroid.equals(centroids.get(i))) {
                    centroids.set(i, newCentroid);
                    changed = true;
                }
            }

            iterations++;

        } while (changed && iterations < MAX_ITERATIONS);
    }

    public List<List<Point>> getClusters() {
        return clusters;
    }
}

class ElbowMethod {

    public static int estimateK(List<Point> points, int maxK) {
        double[] sse = new double[maxK + 1];
        for (int k = 1; k <= maxK; k++) {
            KMeans kMeans = new KMeans(k);
            kMeans.fit(points);
            sse[k] = ClusterUtils.calculateSSE(kMeans.getClusters());
        }

        // Print SSE values for analysis
        for (int k = 1; k <= maxK; k++) {
            System.out.println("k = " + k + ", SSE = " + sse[k]);
        } 


        // Find the elbow point by finding the maximum distance to the line connecting the first and last points
        int elbow = 1;
        double maxDistance = Double.NEGATIVE_INFINITY;
        Point2D.Double point1 = new Point2D.Double(1, sse[1]);
        Point2D.Double pointN = new Point2D.Double(maxK, sse[maxK]);
        for (int k = 2; k < maxK; k++) {
            Point2D.Double pointK = new Point2D.Double(k, sse[k]);
            double distance = distanceToLine(point1, pointN, pointK);
            if (distance > maxDistance) {
                maxDistance = distance;
                elbow = k;
            }
        }

        return elbow;
    }
    // Calculate the distance from a point to a line defined by two points
    private static double distanceToLine(Point2D.Double point1, Point2D.Double point2, Point2D.Double point) {
        double normalLength = point1.distance(point2);
        return Math.abs((point.getX() - point1.getX()) * (point2.getY() - point1.getY()) -
                        (point.getY() - point1.getY()) * (point2.getX() - point1.getX())) / normalLength;
    }
}



public class A2_G10_t1 {

    public static void main(String[] args) {
        if (args.length < 1) {
            System.out.println("Usage: java A2_G10_t1 <input-file> [k]");
            return;
        }

        String fileName = args[0];
        Integer k = args.length > 1 ? Integer.parseInt(args[1]) : null;

        try {
            List<Point> points = readCSV(fileName);

            if (k == null) {
                k = ElbowMethod.estimateK(points, 32);
                System.out.println("estimated k: " + k);
            }


            KMeans kMeans = new KMeans(k);
            kMeans.fit(points);

            List<List<Point>> clusters = kMeans.getClusters();
            for (int i = 0; i < clusters.size(); i++) {
                System.out.print("Cluster #" + (i + 1) + " => ");
                List<Point> sortedPoints = clusters.get(i);
                sortedPoints.sort(Point.idComparator);
                for (Point p : clusters.get(i)) {
                    System.out.print(p.id + " ");
                }
                System.out.println();
                System.out.println();
            }

        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static List<Point> readCSV(String fileName) throws IOException {
        List<Point> points = new ArrayList<>();
        BufferedReader br = new BufferedReader(new FileReader(fileName));
        String line;
        while ((line = br.readLine()) != null) {
            String[] values = line.split(",");
            String id = values[0];
            double x = Double.parseDouble(values[1]);
            double y = Double.parseDouble(values[2]);
            points.add(new Point(id, x, y));
        }
        br.close();
        return points;
    }
}
