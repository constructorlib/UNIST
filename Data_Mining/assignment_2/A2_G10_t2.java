import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.lang.reflect.Array;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.PriorityQueue;
import java.util.Set;

class DBScan {

  static class Point {
    float x, y;
    String name;
    int label;
    ArrayList<Point> neighbors;
    // constructor
    public Point(float x, float y, String name) {
      this.x = x;
      this.y = y;
      this.name = name;
      this.label = -1;
      this.neighbors = new ArrayList<>();
    }
    public double sqrDistance(Point P) {
      float diffX = (this.x - P.x);
      float diffY = (this.y - P.y);
      return (diffX * diffX + diffY * diffY);
    }
  }

  public static void main(String[] args) throws FileNotFoundException, IOException {
    // take mu and epsilon variables from args
    if (args.length < 2) {
      System.out.println("Usage: java A2_G10_t2 <input file> <mu> <epsilon>");
      System.exit(1);
    }
    // mu and eps from argv
    Integer mu = -1;
    Float epsilon = -1.0f;
    for (int i = 1; i < args.length; i++) {
      if (isInt(args[i])) {
        mu = Integer.parseInt(args[i]);
      }
      if (isFloat(args[i])) {
        epsilon = Float.parseFloat(args[i]);
      }
    }
    // read input file and populate items
    ArrayList<Point> points = new ArrayList<>();
    try (BufferedReader br = new BufferedReader(new FileReader(args[0]))) {
      String line;
      while ((line = br.readLine()) != null) {
        String[] values = line.split(",");
        points.add(new Point(Float.parseFloat(values[1]) , Float.parseFloat(values[2]), values[0]));
      }
    }
    if (epsilon < 0) {
      epsilon = DBSCAN_eps(points, mu);
      System.out.println("Estimated eps : " + epsilon);
    }
    if (mu < 0) {
      // Ester et al., 1996
      mu = 4;
      System.out.println("Estimated MinPts : " + mu);
    }
    int C = DBSCAN(points, epsilon, mu);
    // Output clusster size
    int noises = 0;
    // create arraylist of length C
    ArrayList<String>[] clusters = new ArrayList[C + 1];
    for (int i = 0; i <= C; i++) {
      clusters[i] = new ArrayList<>();
    }
    int clusterSize = 0;
    for (Point P : points) {
      if (P.label == 0) {
        noises++;
      }
      if (P.label > 0) {
        clusters[P.label].add(P.name);
      }
    }
    // output clussters
    for (int i = 1; i <= C; i++) {
      if (clusters[i].size() == 0) {
        continue;
      }
      clusterSize++;
    }

    System.out.println("Number of clusters : " + clusterSize);
    System.out.println("Number of noises : " + noises);

    for (int i = 1, c = 0; i <= C; i++) {
      if (clusters[i].size() == 0) {
        continue;
      }
      c++;
      System.out.printf("Cluster #%d => ", c);
      for (String name : clusters[i]) {
        System.out.print(name + " ");
      }
      System.out.println();
    }
  }

  public static int DBSCAN(ArrayList<Point> DB, double eps, int minPts) {
    for (Point P : DB) {
      P.neighbors.clear();
      for (Point Q : DB) {
        if (P.sqrDistance(Q) <= eps * eps) {
          P.neighbors.add(Q);
        }
      }
    }
    int C = 0;
    for (Point P : DB) {
      if (P.label != -1) {
        continue;
      }
      ArrayList<Point> N = RangeQuery(DB, P, eps);
      if (N.size() < minPts) {
        P.label = 0;
        continue;
      }
      C++;
      P.label = C;
      // create set S from N
      Set<Point> S = new HashSet<>(N);
      S.removeIf(x -> x.name.equals(P.name));
      int good = 1;
      while (good > 0) {
        Set<Point> T = new HashSet<>(S);
        for (Point Q : S) {
          if (Q.label == 0) {
            Q.label = C;
          }
          if (Q.label == -1) {
            continue;
          }
          Q.label = C;
          ArrayList<Point> N2 = RangeQuery(DB, Q, eps);
          if (N2.size() >= minPts) {
            T.addAll(N2);
          }
        }
        good = T.size() - S.size();
        S = T;
      }
    }
    return C;
  }
  public static ArrayList<Point> RangeQuery(ArrayList<Point> DB, Point Q, double eps) {
    return Q.neighbors;
  }
  public static float DBSCAN_eps(ArrayList<Point> DB, int minPts) {
    ArrayList<Double> kthDists = new ArrayList<>();
    for (Point P : DB) {
      PriorityQueue<Double> dists = new PriorityQueue<>(Collections.reverseOrder());
      for (Point Q : DB) {
        dists.add(P.sqrDistance(Q));
        if (dists.size() > minPts) {
          dists.poll();
        }
      }
      Double kthDist = dists.poll();
      kthDists.add(kthDist);
    }
    Collections.sort(kthDists);
    Double mx = 0.0;
    int pos = -1;
    for (int i = 1; 2 * i < kthDists.size(); i *= 2) {
      if (kthDists.get(i) - kthDists.get(i/2) > mx) {
        mx = kthDists.get(i) - kthDists.get(i/2);
        pos = i;
      }
    }
    int l = pos, r = 2 * pos;
    while (r - l > 5) {
      int m1 = l + (r - l) / 3;
      int m2 = r - (r - l) / 3;
      double f1 = kthDists.get(m1);
      double f2 = kthDists.get(m2);
      if (f1 < f2) {
        r = m2;
      } else {
        l = m1;
      }
    }
    return (float) Math.sqrt(kthDists.get(r));
  }

  public static boolean isInt(String s) {
    try {
      Integer.parseInt(s);
    } catch (Exception e) {
      return false;
    }
    return true;
  }

  public static boolean isFloat(String s) {
    try {
      Float.parseFloat(s);
      if (!s.contains(".")) {
        return false;
      }
    } catch (Exception e) {
      return false;
    }
    return true;
  }
}