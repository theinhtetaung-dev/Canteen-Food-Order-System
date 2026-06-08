using System;
using System.Collections.Generic;

namespace CFOS.Database.AppDbContextModels;

public partial class TblRole
{
    public int RoleId { get; set; }

    public string RoleName { get; set; } = null!;

    public bool? DeleteFlag { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual ICollection<TblRolePermission> TblRolePermissions { get; set; } = new List<TblRolePermission>();

    public virtual ICollection<TblUser> TblUsers { get; set; } = new List<TblUser>();
}
