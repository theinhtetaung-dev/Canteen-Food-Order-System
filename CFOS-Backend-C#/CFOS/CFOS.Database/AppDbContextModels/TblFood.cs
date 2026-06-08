using System;
using System.Collections.Generic;

namespace CFOS.Database.AppDbContextModels;

public partial class TblFood
{
    public int FoodId { get; set; }

    public int CategoryId { get; set; }

    public string FoodName { get; set; } = null!;

    public string? Description { get; set; }

    public decimal Price { get; set; }

    public string? ImageUrl { get; set; }

    public bool? IsAvailable { get; set; }

    public int CreatedBy { get; set; }

    public bool? DeleteFlag { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual TblFoodCategory Category { get; set; } = null!;

    public virtual TblUser CreatedByNavigation { get; set; } = null!;

    public virtual ICollection<TblOrderItem> TblOrderItems { get; set; } = new List<TblOrderItem>();
}
