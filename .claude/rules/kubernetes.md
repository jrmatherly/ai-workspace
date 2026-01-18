---
globs: ["**/pkg/controller/**", "**/pkg/reconciler/**"]
description: Kubernetes controller patterns - reconciliation, error handling, status updates
---

# Kubernetes Controller Patterns

## Reconciliation Loop

```go
func (r *Reconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
    // 1. Fetch the resource
    obj := &v1.MyResource{}
    if err := r.Get(ctx, req.NamespacedName, obj); err != nil {
        return ctrl.Result{}, client.IgnoreNotFound(err)
    }

    // 2. Check deletion
    if !obj.DeletionTimestamp.IsZero() {
        return r.handleDeletion(ctx, obj)
    }

    // 3. Add finalizer
    if !controllerutil.ContainsFinalizer(obj, finalizerName) {
        controllerutil.AddFinalizer(obj, finalizerName)
        return ctrl.Result{}, r.Update(ctx, obj)
    }

    // 4. Reconcile logic
    return r.reconcile(ctx, obj)
}
```

## Error Handling

- Return `ctrl.Result{}, err` for retryable errors
- Return `ctrl.Result{Requeue: true}` for explicit requeue
- Return `ctrl.Result{RequeueAfter: duration}` for delayed retry
- Return `ctrl.Result{}, nil` for success (no requeue)

## Status Updates

Always update status in a separate call:

```go
obj.Status.Conditions = append(obj.Status.Conditions, condition)
return ctrl.Result{}, r.Status().Update(ctx, obj)
```

## nah Framework

For nah-based controllers, use the Router/Backend/Apply pattern:

### Router

```go
type Router struct {
    backend Backend
}

func (r *Router) Routes() []router.Route {
    return []router.Route{
        {Path: "/myresource", Handler: r.handleMyResource},
    }
}
```

### Backend

```go
type Backend interface {
    Get(ctx context.Context, name string) (*v1.MyResource, error)
    Apply(ctx context.Context, obj *v1.MyResource) error
}
```

### Apply Pattern

```go
// Declarative resource management
if err := r.backend.Apply(ctx, desired); err != nil {
    return ctrl.Result{}, fmt.Errorf("apply failed: %w", err)
}
```

## Finalizers

```go
const finalizerName = "mygroup.example.com/finalizer"

func (r *Reconciler) handleDeletion(ctx context.Context, obj *v1.MyResource) (ctrl.Result, error) {
    if controllerutil.ContainsFinalizer(obj, finalizerName) {
        // Cleanup logic here
        if err := r.cleanup(ctx, obj); err != nil {
            return ctrl.Result{}, err
        }

        controllerutil.RemoveFinalizer(obj, finalizerName)
        return ctrl.Result{}, r.Update(ctx, obj)
    }
    return ctrl.Result{}, nil
}
```

## Testing

Use envtest for controller tests:

```go
func TestReconcile(t *testing.T) {
    testEnv := &envtest.Environment{
        CRDDirectoryPaths: []string{"../config/crd"},
    }
    cfg, err := testEnv.Start()
    // ...
}
```
