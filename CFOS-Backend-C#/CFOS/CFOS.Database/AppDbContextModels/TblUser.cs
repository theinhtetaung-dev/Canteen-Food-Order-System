using System;
using System.Collections.Generic;

namespace CFOS.Database.AppDbContextModels;

public partial class TblUser
{
    public int UserId { get; set; }

    public int RoleId { get; set; }

    public string UserName { get; set; } = null!;

    public string FullName { get; set; } = null!;

    public string? Email { get; set; }

    public string PasswordHash { get; set; } = null!;

    public string? PhoneNumber { get; set; }

    public string Status { get; set; } = null!;

    public bool? DeleteFlag { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual TblRole Role { get; set; } = null!;

    public virtual ICollection<TblFoodCategory> TblFoodCategories { get; set; } = new List<TblFoodCategory>();

    public virtual ICollection<TblFood> TblFoods { get; set; } = new List<TblFood>();

    public virtual ICollection<TblOrder> TblOrders { get; set; } = new List<TblOrder>();
}
