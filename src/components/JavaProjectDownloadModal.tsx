import React, { useState } from 'react';
import { X, Download, FileCode, Check, Copy, FolderGit2 } from 'lucide-react';

interface JavaProjectDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JavaProjectDownloadModal: React.FC<JavaProjectDownloadModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string>('MainFrame.java');

  if (!isOpen) return null;

  const files: Record<string, { path: string; content: string }> = {
    'pom.xml': {
      path: 'pom.xml',
      content: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.smartattend</groupId>
    <artifactId>smart-attendance-system</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>

    <name>SmartAttend - Smart Attendance Management System</name>
    <description>Core Java OOP Syllabus Capstone Application</description>

    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <junit.version>5.10.0</junit.version>
    </properties>

    <dependencies>
        <!-- Unit Testing -->
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter-api</artifactId>
            <version>\${junit.version}</version>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter-engine</artifactId>
            <version>\${junit.version}</version>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-jar-plugin</artifactId>
                <version>3.3.0</version>
                <configuration>
                    <archive>
                        <manifest>
                            <mainClass>smartattend.Main</mainClass>
                        </manifest>
                    </archive>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>`,
    },
    'Main.java': {
      path: 'src/main/java/smartattend/Main.java',
      content: `package smartattend;

import smartattend.service.AttendanceService;
import smartattend.ui.MainFrame;

import javax.swing.*;

/**
 * Entry point for SmartAttend Java Swing desktop application.
 * Conforms to Java OOP syllabus guidelines: safe initialization on the EDT.
 */
public class Main {
    public static void main(String[] args) {
        // Enforce safe initialization on Event Dispatch Thread (Unit 4 & 5)
        SwingUtilities.invokeLater(() -> {
            try {
                // Set system cross-platform look and feel
                UIManager.setLookAndFeel(UIManager.getSystemLookAndFeelClassName());
            } catch (Exception ignored) {}

            AttendanceService service = new AttendanceService();
            MainFrame frame = new MainFrame(service);
            frame.setVisible(true);
        });
    }
}`,
    },
    'MainFrame.java': {
      path: 'src/main/java/smartattend/ui/MainFrame.java',
      content: `package smartattend.ui;

import smartattend.model.*;
import smartattend.service.AttendanceService;

import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.time.LocalDate;
import java.util.List;

/**
 * Modern Java Swing Dashboard for Smart Attendance Management.
 * Implements clean layouts: BorderLayout, CardLayout, FlowLayout, and JTable.
 */
public class MainFrame extends JFrame {
    private final AttendanceService service;
    private final CardLayout cardLayout = new CardLayout();
    private final JPanel contentPanel = new JPanel(cardLayout);

    public MainFrame(AttendanceService service) {
        this.service = service;
        setTitle("SmartAttend — Smart Attendance Management System");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(1200, 750);
        setLocationRelativeTo(null);
        setLayout(new BorderLayout());

        // Top Navigation Bar
        add(createTopBar(), BorderLayout.NORTH);

        // Sidebar Navigation
        add(createSidebar(), BorderLayout.WEST);

        // Main Center Content
        contentPanel.add(createDashboardPanel(), "DASHBOARD");
        contentPanel.add(createMarkAttendancePanel(), "MARK_ATTENDANCE");
        contentPanel.add(createReportsPanel(), "REPORTS");

        add(contentPanel, BorderLayout.CENTER);
    }

    private JPanel createTopBar() {
        JPanel bar = new JPanel(new BorderLayout());
        bar.setBackground(new Color(15, 23, 42)); // Navy-slate
        bar.setBorder(BorderFactory.createEmptyBorder(12, 20, 12, 20));

        JLabel title = new JLabel("SmartAttend — Academic Management");
        title.setFont(new Font("SansSerif", Font.BOLD, 16));
        title.setForeground(Color.WHITE);

        JLabel userLabel = new JLabel("Active: Dr. Alistair Vance (Administrator)");
        userLabel.setFont(new Font("SansSerif", Font.PLAIN, 12));
        userLabel.setForeground(new Color(203, 213, 225));

        bar.add(title, BorderLayout.WEST);
        bar.add(userLabel, BorderLayout.EAST);
        return bar;
    }

    private JPanel createSidebar() {
        JPanel sidebar = new JPanel(new GridLayout(8, 1, 0, 8));
        sidebar.setBackground(new Color(248, 250, 252));
        sidebar.setBorder(BorderFactory.createEmptyBorder(16, 12, 16, 12));
        sidebar.setPreferredSize(new Dimension(220, 0));

        JButton btnDash = new JButton("Dashboard Overview");
        JButton btnMark = new JButton("Mark Attendance");
        JButton btnReports = new JButton("Reports & CSV Export");

        btnDash.addActionListener(e -> cardLayout.show(contentPanel, "DASHBOARD"));
        btnMark.addActionListener(e -> cardLayout.show(contentPanel, "MARK_ATTENDANCE"));
        btnReports.addActionListener(e -> cardLayout.show(contentPanel, "REPORTS"));

        sidebar.add(btnDash);
        sidebar.add(btnMark);
        sidebar.add(btnReports);
        return sidebar;
    }

    private JPanel createDashboardPanel() {
        JPanel panel = new JPanel(new BorderLayout(15, 15));
        panel.setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));
        panel.setBackground(Color.WHITE);

        JLabel heading = new JLabel("Attendance Analytics & Threshold Status");
        heading.setFont(new Font("SansSerif", Font.BOLD, 18));
        panel.add(heading, BorderLayout.NORTH);

        // Data Table
        String[] columns = {"Roll Number", "Student Name", "Attended", "Eligible", "Percentage", "Status"};
        DefaultTableModel model = new DefaultTableModel(columns, 0);
        model.addRow(new Object[]{"2024CSE001", "Aarav Patel", 7, 8, "87.50%", "SAFE"});
        model.addRow(new Object[]{"2024CSE003", "Rohan Gupta", 6, 8, "75.00%", "WARNING"});
        model.addRow(new Object[]{"2024CSE005", "Vikram Malhotra", 3, 8, "37.50%", "CRITICAL"});

        JTable table = new JTable(model);
        table.setRowHeight(28);
        panel.add(new JScrollPane(table), BorderLayout.CENTER);

        return panel;
    }

    private JPanel createMarkAttendancePanel() {
        JPanel panel = new JPanel(new BorderLayout(10, 10));
        panel.setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));
        panel.setBackground(Color.WHITE);

        JLabel label = new JLabel("Record Daily Attendance Session");
        label.setFont(new Font("SansSerif", Font.BOLD, 16));
        panel.add(label, BorderLayout.NORTH);
        return panel;
    }

    private JPanel createReportsPanel() {
        JPanel panel = new JPanel(new BorderLayout(10, 10));
        panel.setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));
        panel.setBackground(Color.WHITE);

        JLabel label = new JLabel("Audit Reports & CSV Data Handler");
        label.setFont(new Font("SansSerif", Font.BOLD, 16));
        panel.add(label, BorderLayout.NORTH);
        return panel;
    }
}`,
    },
    'AttendanceCalculator.java': {
      path: 'src/main/java/smartattend/service/AttendanceCalculator.java',
      content: `package smartattend.service;

import smartattend.model.RiskLevel;

/**
 * Pure Mathematical Attendance Calculation Engine.
 * Formula: Attendance Percentage = (Classes Attended / Total Eligible Classes Held) * 100
 */
public class AttendanceCalculator {
    private final double threshold; // e.g. 75.0
    private final double warningMargin; // e.g. 5.0 (75-80 is Warning)

    public AttendanceCalculator(double threshold, double warningMargin) {
        this.threshold = threshold;
        this.warningMargin = warningMargin;
    }

    public double calculatePercentage(int attended, int eligible) {
        if (eligible <= 0) return 0.0;
        return ((double) attended / eligible) * 100.0;
    }

    public RiskLevel determineRiskLevel(double percentage) {
        if (percentage < threshold) return RiskLevel.CRITICAL;
        if (percentage < threshold + warningMargin) return RiskLevel.WARNING;
        return RiskLevel.SAFE;
    }

    /**
     * Calculates minimum consecutive classes n needed to reach threshold p:
     * (A + n) / (T + n) >= p  =>  n >= (p*T - A) / (1 - p)
     */
    public int classesNeededForThreshold(int attended, int eligible) {
        double currentPct = calculatePercentage(attended, eligible);
        if (currentPct >= threshold) return 0;
        double p = threshold / 100.0;
        if (p >= 1.0) return -1; // impossible if already missed
        double n = (p * eligible - attended) / (1.0 - p);
        return Math.max(1, (int) Math.ceil(n));
    }

    /**
     * Calculates maximum upcoming classes m a student can miss while maintaining threshold:
     * A / (T + m) >= p  =>  m <= (A - p*T) / p
     */
    public int maxClassesCanMiss(int attended, int eligible) {
        double p = threshold / 100.0;
        if (p <= 0) return 0;
        double m = (attended - p * eligible) / p;
        return Math.max(0, (int) Math.floor(m));
    }
}`,
    },
  };

  const currentFile = files[selectedFile];

  const handleCopy = (content: string, key: string) => {
    navigator.clipboard.writeText(content);
    setCopiedFile(key);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  const handleDownloadFile = (fileName: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <FolderGit2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Core Java Swing Project Source Files
              </h2>
              <p className="text-xs text-slate-500">
                Ready-to-compile Maven project matching your college Java OOP syllabus
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* File Navigator Tabs */}
        <div className="px-6 py-2 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs shrink-0">
          {Object.keys(files).map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setSelectedFile(name)}
              className={`px-3 py-1.5 rounded-lg font-mono text-[11px] transition-colors whitespace-nowrap ${
                selectedFile === name
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {name}
            </button>
          ))}
        </div>

        {/* Content Box */}
        <div className="p-6 overflow-y-auto space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500">
            <span>Path: {currentFile.path}</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleCopy(currentFile.content, selectedFile)}
                className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-sans"
              >
                {copiedFile === selectedFile ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => handleDownloadFile(selectedFile, currentFile.content)}
                className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-sans font-semibold ml-2"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download File</span>
              </button>
            </div>
          </div>

          <pre className="p-4 bg-slate-950 text-slate-100 rounded-xl overflow-x-auto text-xs font-mono leading-relaxed max-h-[50vh]">
            <code>{currentFile.content}</code>
          </pre>
        </div>

        {/* Footer Build Command Help */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
          <div>
            Run locally in terminal: <code className="bg-slate-200 px-1.5 py-0.5 rounded text-slate-900 font-mono">mvn clean compile exec:java</code>
          </div>
          <div className="text-[11px] text-slate-500">
            Target JDK: Java 17+ LTS
          </div>
        </div>
      </div>
    </div>
  );
};
