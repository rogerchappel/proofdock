export type ArtifactType = 'note' | 'log' | 'screenshot' | 'file';

export interface ProofdockConfig {
  version: 1;
  summary: {
    title: string;
    overview: string;
  };
  repo?: {
    root?: string;
  };
  artifacts?: ArtifactInput[];
  globs?: GlobInput[];
  commands?: CommandInput[];
  reviewer?: {
    risks?: string[];
    nextSteps?: string[];
  };
  redact?: boolean;
}

export interface ArtifactInput {
  path: string;
  title?: string;
  type?: ArtifactType;
}

export interface GlobInput {
  pattern: string;
  type?: ArtifactType;
  titlePrefix?: string;
}

export interface CommandInput {
  id: string;
  title?: string;
  command: string[];
  cwd?: string;
  allowFailure?: boolean;
}

export interface ProofBundle {
  generatedAt: string;
  configPath: string;
  repoRoot: string;
  summary: {
    title: string;
    overview: string;
  };
  git: {
    branch: string;
    head: string;
    commits: CommitRecord[];
    changedFiles: string[];
    status: string[];
  };
  artifacts: ProofArtifact[];
  checks: ProofCheck[];
  reviewer: {
    risks: string[];
    nextSteps: string[];
  };
  output: {
    jsonPath: string;
    markdownPath: string;
    htmlPath: string;
    prCommentPath: string;
  };
}

export interface CommitRecord {
  sha: string;
  subject: string;
  author: string;
}

export interface ProofArtifact {
  sourcePath: string;
  relativeSourcePath: string;
  bundledPath: string;
  title: string;
  type: ArtifactType;
  mediaType: 'text' | 'binary';
  preview?: string;
}

export interface ProofCheck {
  id: string;
  title: string;
  cwd: string;
  command: string[];
  exitCode: number;
  status: 'passed' | 'failed';
  stdout: string;
  stderr: string;
}
