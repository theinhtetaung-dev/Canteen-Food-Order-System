using System;
using System.Collections.Generic;

namespace CFOS.Database.AppDbContextModels;

public partial class TblPermission
{
    public int PermissionId { get; set; }

    public string MenuName { get; set; } = null!;

    public string ActionName { get; set; } = null!;

    public bool? DeleteFlag { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual ICollection<TblRolePermission> TblRolePermissions { get; set; } = new List<TblRolePermission>();
}
