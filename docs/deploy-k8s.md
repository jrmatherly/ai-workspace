# Deploy AI Workspace with Kubernetes ☸️

In this tutorial, we will guide you through the process of deploying AI Workspace
in a Kubernetes environment using the kubectl command-line tool.

## First Deployment

### Step 1: Clone the AI Workspace repository

```bash
git clone https://github.com/jrmatherly/ai-workspace
cd ./ai-workspace/docs/k8s
```

### Step 2: Create the namespace

```bash
kubectl create namespace ns-ai-workspace
```

### Step 3: Fill in the key information into env-secret.yaml

All variables are optional. By default, Kubernetes Secret uses Base64 for
encode/decode, so please don't do a git commit after filling in the keys
to avoid leaking sensitive information.

We provide an empty `env-secret.yaml` file as a template.
You can fill in the necessary information using a text editor.

```bash
nano env-secret.yaml
```

### Step 4: Deploying Kubernetes Resources

```bash
kubectl apply -f ai-workspace-deployment.yaml -f env-secret.yaml
```

### Step 5: Verifying the Resource Statuses

```bash
$ kubectl -n ns-ai-workspace get svc,pod,deployment
NAME                  TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)    AGE
service/svc-ai-workspace   ClusterIP   10.0.198.118   <none>        3000/TCP   63m

NAME                                     READY   STATUS    RESTARTS   AGE
pod/deployment-ai-workspace-xxxxxxxx-yyyyy    1/1     Running   0          39m

NAME                              READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/deployment-ai-workspace   1/1     1            1           63m
```

### Step 6: Testing the Service

The manifest probes `GET /api/trpc/backend.listCapabilities` (200 with a JSON body) for readiness and liveness; there is no dedicated health route. Use the same path from any external monitor.

You can test the service by port-forwarding the service to your local machine:

```bash
$ kubectl -n ns-ai-workspace port-forward service/svc-ai-workspace 3000
Forwarding from 127.0.0.1:3000 -> 3000
Forwarding from [::1]:3000 -> 3000
```

Now you can access the service at `http://localhost:3000`, and you should see the AI Workspace homepage.

### Step 7 (optional): Authentication

See [Authentication](deploy-authentication.md). In `env-secret.yaml`, set `AUTH_SECRET`, `AUTH_URL` (the public
https host users open, the gateway host behind a gateway), one provider's variables, `AUTH_ALLOWED_EMAILS`,
`AUTH_ADMIN_EMAILS`, and both Postgres URLs. The readiness and liveness probes stay on
`/api/trpc/backend.listCapabilities`, which answers without a session.

Run the database migrations once per release, before the rollout, as a Job that runs the app image (same tag or
digest as the Deployment) with the migrate command. The image carries the Prisma CLI, the schema and the migrations,
runs read-only as uid 1001, and needs only `POSTGRES_URL_NON_POOLING`:

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: ai-workspace-migrate
  namespace: ns-ai-workspace
spec:
  backoffLimit: 2
  template:
    spec:
      restartPolicy: Never
      containers:
        - name: migrate
          image: ghcr.io/jrmatherly/ai-workspace:<tag>
          command: ["/app/node_modules/.bin/prisma", "migrate", "deploy"]
          envFrom:
            - secretRef:
                name: env
```

On a database created with `prisma db push`, run `npx prisma migrate resolve --applied 0_init` once first
([Database](deploy-database.md)).

If an Envoy Gateway OIDC SecurityPolicy fronts the app, remove it once app authentication is on; in the interim,
set `denyRedirect` for `/api/*` so a lapsed gateway session returns 401 instead of a redirect.

## Updating AI Workspace

To update AI Workspace to the latest version:

1. Pull the latest changes from the repository:

   ```bash
   git pull origin main
   ```

2. Apply the updated deployment:

   ```bash
   kubectl apply -f ai-workspace-deployment.yaml
   ```

This will trigger a rolling update of the deployment with the latest image.

**Note**: If you're deploying AI Workspace behind a reverse proxy, you may need to configure
your proxy to support streaming. See our [Reverse Proxy Deployment Guide](deploy-reverse-proxy.md) for more information.

Note: For production use, consider setting up an Ingress Controller or Load Balancer instead of using port-forward.
