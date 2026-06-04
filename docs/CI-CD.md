# CI/CD Docker Hub

This project uses GitHub Actions to automatically test, build, scan, and publish a Docker image to Docker Hub.

## Workflow

File:

- `.github/workflows/docker-publish.yml`

Trigger:

- Push to `main`
- Push tag starting with `v` (example: `v1.0.0`)
- Manual run via `workflow_dispatch`

Pipeline steps:

1. Install dependencies and run tests if test files exist
2. Build Docker image with Buildx
3. Push image to Docker Hub
4. Install Docker Scout CLI and scan pushed image by immutable digest (fails only on `CRITICAL` vulnerabilities)
5. Generate and upload SBOM artifact

## Required GitHub Secrets

Add these repository secrets in GitHub:

1. `DOCKERHUB_USERNAME`: your Docker Hub username
2. `DOCKERHUB_TOKEN`: Docker Hub access token (not your account password)

How to create token:

1. Docker Hub -> Account Settings -> Personal Access Tokens
2. Create token with write permission for image push
3. Save token value into `DOCKERHUB_TOKEN`

## Image Tags Produced

The workflow publishes these tags:

1. `latest` for default branch (`main`)
2. `sha-<commit_sha>` for immutable versioning
3. `<git_tag>` when you push a version tag (example: `v1.0.0`)

Image repository format:

- `docker.io/<DOCKERHUB_USERNAME>/apant-fe`

## Pull and Run

Example pull:

```bash
docker pull docker.io/<DOCKERHUB_USERNAME>/apant-fe:latest
```

Example run:

```bash
docker run --rm -p 5173:5173 docker.io/<DOCKERHUB_USERNAME>/apant-fe:latest
```

## Security Defaults in CI

- Minimal GitHub permissions per job
- Cached Docker builds using GitHub Actions cache
- Scanner and SBOM target immutable image digest
- Build provenance (`provenance: mode=min`)
- SBOM generation and artifact upload
- Vulnerability scan gate for `CRITICAL` issues

## Recommended Operational Practice

1. Pull by immutable tag (`sha-...`) in production
2. Keep `latest` for quick manual verification only
3. Rebuild image regularly to absorb base image security updates
4. Review scanner findings and fix forward continuously
